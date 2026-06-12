"""
Accentrix AI Service
FastAPI application for speech pronunciation analysis.
Supports Azure Cognitive Services and mock analysis mode.
"""

import os
import uuid
import random
import math
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

load_dotenv()

# ─── App Setup ────────────────────────────────────────────
app = FastAPI(
    title="Accentrix AI Service",
    description="Speech pronunciation analysis powered by AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("./temp_audio")
UPLOAD_DIR.mkdir(exist_ok=True)

ANALYSIS_MODE = os.getenv("ANALYSIS_MODE", "whisper")


# ─── Models ───────────────────────────────────────────────
class WordResult(BaseModel):
    word: str
    score: int
    status: str  # correct, mispronounced, missed
    phonemes: list = []


class AnalysisResult(BaseModel):
    overallScore: int
    pronunciationScore: int
    fluencyScore: int
    completenessScore: int
    words: list[WordResult]
    suggestions: list[str]
    recognizedText: str
    language: str
    source: str  # "azure" or "mock"


class TtsRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    language: str = Field(default="en-US")


# Neural voices for each app language (Edge TTS — free, high quality)
PREFERRED_TTS_VOICES = {
    "en-US": "en-US-JennyNeural",
    "es-ES": "es-ES-ElviraNeural",
    "fr-FR": "fr-FR-DeniseNeural",
    "de-DE": "de-DE-KatjaNeural",
    "it-IT": "it-IT-ElsaNeural",
    "pt-BR": "pt-BR-FranciscaNeural",
    "hi-IN": "hi-IN-SwaraNeural",
    "ja-JP": "ja-JP-NanamiNeural",
    "zh-CN": "zh-CN-XiaoxiaoNeural",
}


async def resolve_tts_voice(language: str) -> str:
    """Pick the best Edge TTS neural voice for a BCP-47 language code."""
    try:
        import edge_tts
    except ImportError:
        raise HTTPException(status_code=503, detail="edge-tts not installed")

    if language in PREFERRED_TTS_VOICES:
        return PREFERRED_TTS_VOICES[language]

    try:
        voices = await edge_tts.list_voices()
        lang_lower = language.lower()

        for voice in voices:
            if voice["Locale"].lower() == lang_lower and "Neural" in voice["ShortName"]:
                return voice["ShortName"]

        prefix = lang_lower.split("-")[0]
        for voice in voices:
            locale = voice["Locale"].lower()
            if locale.startswith(prefix) and "Neural" in voice["ShortName"]:
                return voice["ShortName"]
    except Exception as e:
        print(f"[TTS WARN] Could not fetch voice list: {e}")

    raise HTTPException(status_code=404, detail=f"No TTS voice available for language: {language}")


# ─── Health Check ─────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "accentrix-ai-service",
        "analysisMode": ANALYSIS_MODE,
    }


# ─── Pronunciation Analysis ──────────────────────────────
@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze_pronunciation(
    audio: UploadFile = File(...),
    language: str = Form(default="en-US"),
    reference_text: str = Form(default=""),
):
    """
    Analyze pronunciation from an audio file.
    
    - **audio**: Audio file (WAV, WebM, OGG, MP3)
    - **language**: BCP-47 language code (e.g., en-US, es-ES, fr-FR)
    - **reference_text**: The expected text the user should have said
    """
    # Save uploaded audio to temp file
    file_id = str(uuid.uuid4())
    file_ext = Path(audio.filename or "audio.webm").suffix or ".webm"
    temp_path = UPLOAD_DIR / f"{file_id}{file_ext}"

    try:
        with open(temp_path, "wb") as f:
            content = await audio.read()
            f.write(content)

        file_size_kb = len(content) / 1024
        print(f"[MIC] Received audio: {audio.filename} ({file_size_kb:.1f}KB)")
        print(f"      Language: {language}, Reference: \"{reference_text[:60]}...\"")

        # Route to appropriate analyzer
        if ANALYSIS_MODE == "whisper":
            result = await analyze_with_whisper(temp_path, language, reference_text)
        else:
            result = generate_mock_analysis(reference_text, language)

        print(f"[OK] Analysis complete: score={result.overallScore} (source={result.source})")
        return result

    except Exception as e:
        print(f"[ERR] Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Cleanup temp file
        if temp_path.exists():
            temp_path.unlink()




# ─── Local Whisper Integration ───────────────────────────
async def analyze_with_whisper(audio_path: Path, language: str, reference_text: str) -> AnalysisResult:
    """
    Analyze pronunciation using local OpenAI Whisper.
    Requires: pip install openai-whisper Levenshtein
    Requires: ffmpeg installed on your system
    """
    try:
        import whisper
        import Levenshtein
    except ImportError:
        print("[WARN] Whisper not installed. Run: pip install openai-whisper Levenshtein")
        return generate_mock_analysis(reference_text, language)

    # Note: Loading the model globally is better for performance, but we load it here for simplicity
    print("[AI] Loading local Whisper model...")
    model = whisper.load_model("base")
    
    print("[AI] Transcribing with Whisper...")
    # Use just the base language code (e.g., 'en' from 'en-US')
    base_lang = language.split('-')[0]
    
    # Load the 16kHz WAV file into a numpy array to bypass FFmpeg entirely
    try:
        import scipy.io.wavfile as wav
        import numpy as np
        sample_rate, audio_data = wav.read(str(audio_path))
        
        # Ensure it's float32 normalized between -1.0 and 1.0 (Whisper requirement)
        if audio_data.dtype == np.int16:
            audio_data = audio_data.astype(np.float32) / 32768.0
    except Exception as e:
        print(f"[AI ERROR] Could not read WAV file with scipy: {e}")
        # Fallback: let Whisper handle the file directly with FFmpeg
        audio_data = str(audio_path)
        
    result = model.transcribe(audio_data, language=base_lang)
    recognized_text = result["text"].strip()
    
    print(f"[AI] Transcribed: {recognized_text}")

    # Calculate custom scores using improved algorithm
    import string
    from difflib import SequenceMatcher
    
    def clean_text(t):
        return t.lower().translate(str.maketrans('', '', string.punctuation))

    ref_text_clean = clean_text(reference_text)
    rec_text_clean = clean_text(recognized_text)
    
    ref_words = ref_text_clean.split()
    rec_words = rec_text_clean.split()
    
    # Calculate Word Error Rate (WER) - proper implementation
    # WER = (Substitutions + Deletions + Insertions) / Total Reference Words
    def calculate_wer(reference, hypothesis):
        """Calculate Word Error Rate using edit distance"""
        ref = reference.split()
        hyp = hypothesis.split()
        
        # Build edit distance matrix
        d = [[0] * (len(hyp) + 1) for _ in range(len(ref) + 1)]
        
        for i in range(len(ref) + 1):
            d[i][0] = i
        for j in range(len(hyp) + 1):
            d[0][j] = j
            
        for i in range(1, len(ref) + 1):
            for j in range(1, len(hyp) + 1):
                if ref[i-1] == hyp[j-1]:
                    d[i][j] = d[i-1][j-1]
                else:
                    substitution = d[i-1][j-1] + 1
                    insertion = d[i][j-1] + 1
                    deletion = d[i-1][j] + 1
                    d[i][j] = min(substitution, insertion, deletion)
        
        wer = d[len(ref)][len(hyp)] / max(len(ref), 1)
        return min(1.0, wer)
    
    wer = calculate_wer(ref_text_clean, rec_text_clean)
    pronunciation_accuracy = max(0, int((1 - wer) * 100))
    
    # Improved word-by-word analysis using sequence alignment
    matcher = SequenceMatcher(None, ref_words, rec_words)
    words_breakdown = []
    
    for ref_idx, ref_word in enumerate(ref_words):
        # Find best matching word in recognized text
        best_score = 0
        best_match = None
        
        # Check words near the expected position (within ±2 positions)
        search_start = max(0, ref_idx - 2)
        search_end = min(len(rec_words), ref_idx + 3)
        
        for rec_idx in range(search_start, search_end):
            if rec_idx < len(rec_words):
                similarity = Levenshtein.ratio(ref_word, rec_words[rec_idx])
                if similarity > best_score:
                    best_score = similarity
                    best_match = rec_words[rec_idx]
        
        # Also check exact matches anywhere in the text
        if ref_word in rec_words:
            best_score = max(best_score, 1.0)
            best_match = ref_word
        
        word_score = int(best_score * 100)
        
        # Determine status based on score
        if word_score >= 85:
            status = "correct"
        elif word_score >= 60:
            status = "mispronounced"
        else:
            status = "missed"
        
        words_breakdown.append(WordResult(
            word=ref_word,
            score=word_score,
            status=status
        ))
    
    # Calculate overall scores
    avg_word_score = sum(w.score for w in words_breakdown) / max(len(words_breakdown), 1)
    
    # Pronunciation Score: Based on WER and word-level accuracy
    pronunciation_score = int((pronunciation_accuracy * 0.6) + (avg_word_score * 0.4))
    
    # Fluency Score: Based on transcription confidence and length match
    length_ratio = len(rec_words) / max(len(ref_words), 1)
    fluency_penalty = abs(1.0 - length_ratio) * 20  # Penalty for too fast/slow
    fluency_score = max(0, min(100, int(pronunciation_score - fluency_penalty)))
    
    # Completeness Score: How much of the reference was captured
    words_spoken = sum(1 for w in words_breakdown if w.status != "missed")
    completeness_score = int((words_spoken / max(len(ref_words), 1)) * 100)
    
    # Overall Score: Weighted average
    overall_score = int(
        (pronunciation_score * 0.4) + 
        (fluency_score * 0.3) + 
        (completeness_score * 0.3)
    )
    
    # Generate intelligent suggestions
    suggestions = []
    missed_words = [w.word for w in words_breakdown if w.status == "missed"]
    mispronounced_words = [w.word for w in words_breakdown if w.status == "mispronounced"]
    
    if missed_words:
        suggestions.append(f"You missed these words: {', '.join(missed_words[:3])}. Try speaking more clearly.")
    
    if mispronounced_words:
        suggestions.append(f"Focus on pronouncing: {', '.join(mispronounced_words[:3])}. Listen to the native pronunciation.")
    
    if fluency_score < 70:
        if length_ratio < 0.8:
            suggestions.append("You spoke too quickly or skipped words. Try to speak at a natural pace.")
        elif length_ratio > 1.2:
            suggestions.append("You spoke too slowly or added extra words. Maintain a steady rhythm.")
    
    if overall_score >= 90:
        suggestions.append("Excellent! Your pronunciation is very clear and accurate.")
    elif overall_score >= 75:
        suggestions.append("Good job! Keep practicing to improve further.")
    elif overall_score < 60:
        suggestions.append("Keep practicing! Listen to the native pronunciation and repeat several times.")
    
    if not suggestions:
        suggestions.append("Practice makes perfect! Keep working on your pronunciation.")
    
    print(f"[AI] Scores - Overall: {overall_score}, Pronunciation: {pronunciation_score}, Fluency: {fluency_score}, Completeness: {completeness_score}")

    return AnalysisResult(
        overallScore=overall_score,
        pronunciationScore=pronunciation_score,
        fluencyScore=fluency_score,
        completenessScore=completeness_score,
        words=words_breakdown,
        suggestions=suggestions,
        recognizedText=recognized_text,
        language=language,
        source="local_whisper"
    )

# ─── Mock Analysis ────────────────────────────────────────
def generate_mock_analysis(reference_text: str, language: str) -> AnalysisResult:
    """
    Generate realistic mock pronunciation analysis results.
    Used when Azure is not configured or unavailable.
    """
    words_list = reference_text.split() if reference_text else ["hello", "world"]

    word_results = []
    for word in words_list:
        # Generate somewhat realistic scores — harder words get lower scores
        base_score = random.randint(65, 100)

        # Simulate harder pronunciation for longer/complex words
        if len(word) > 7:
            base_score = max(55, base_score - random.randint(5, 15))

        status = "correct"
        if base_score < 70:
            status = "missed"
        elif base_score < 80:
            status = "mispronounced"

        word_results.append(WordResult(
            word=word,
            score=base_score,
            status=status,
        ))

    avg_score = round(sum(w.score for w in word_results) / len(word_results))

    # Generate correlated sub-scores
    pronunciation_score = min(100, avg_score + random.randint(-5, 8))
    fluency_score = max(40, avg_score - random.randint(0, 15))
    completeness_score = min(100, avg_score + random.randint(0, 12))

    # Generate suggestions
    suggestions = []
    mispronounced = [w for w in word_results if w.status == "mispronounced"]
    if mispronounced:
        for w in mispronounced[:2]:
            suggestions.append(f'Focus on the pronunciation of "{w.word}" — practice the individual sounds slowly.')
    suggestions.append("Try speaking at a natural, consistent pace for better fluency scores.")
    if avg_score > 80:
        suggestions.append("Great job! Your pronunciation is very clear overall.")

    return AnalysisResult(
        overallScore=avg_score,
        pronunciationScore=pronunciation_score,
        fluencyScore=fluency_score,
        completenessScore=completeness_score,
        words=word_results,
        suggestions=suggestions,
        recognizedText=reference_text or "hello world",
        language=language,
        source="mock",
    )


# ─── Text-to-Speech (Edge TTS) ───────────────────────────
@app.post("/api/tts")
async def text_to_speech(body: TtsRequest):
    """
    Convert text to natural speech using Microsoft Edge neural voices.
    Separate from Whisper — this is text → audio only (Listen button).
    """
    try:
        import edge_tts
    except ImportError:
        raise HTTPException(status_code=503, detail="edge-tts not installed. Run: pip install edge-tts")

    text = body.text.strip()
    
    try:
        voice = await resolve_tts_voice(body.language)
        print(f"[TTS] language={body.language} voice={voice} text=\"{text[:60]}...\"")

        communicate = edge_tts.Communicate(text, voice)

        async def audio_stream():
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]

        return StreamingResponse(audio_stream(), media_type="audio/mpeg")
    except Exception as e:
        print(f"[TTS ERROR] {str(e)}")
        raise HTTPException(status_code=503, detail=f"TTS service error: {str(e)}")


# ─── Supported Languages ─────────────────────────────────
@app.get("/api/languages")
async def get_supported_languages():
    """Return list of supported languages with BCP-47 codes."""
    return {
        "languages": [
            {"code": "en-US", "name": "English (US)", "flag": "🇺🇸"},
            {"code": "en-GB", "name": "English (UK)", "flag": "🇬🇧"},
            {"code": "es-ES", "name": "Spanish (Spain)", "flag": "🇪🇸"},
            {"code": "es-MX", "name": "Spanish (Mexico)", "flag": "🇲🇽"},
            {"code": "fr-FR", "name": "French", "flag": "🇫🇷"},
            {"code": "de-DE", "name": "German", "flag": "🇩🇪"},
            {"code": "it-IT", "name": "Italian", "flag": "🇮🇹"},
            {"code": "pt-BR", "name": "Portuguese (Brazil)", "flag": "🇧🇷"},
            {"code": "ja-JP", "name": "Japanese", "flag": "🇯🇵"},
            {"code": "ko-KR", "name": "Korean", "flag": "🇰🇷"},
            {"code": "zh-CN", "name": "Mandarin (Simplified)", "flag": "🇨🇳"},
            {"code": "ar-SA", "name": "Arabic", "flag": "🇸🇦"},
            {"code": "hi-IN", "name": "Hindi", "flag": "🇮🇳"},
            {"code": "ru-RU", "name": "Russian", "flag": "🇷🇺"},
        ]
    }


# ─── Run ──────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"\n[AI] Accentrix AI Service starting on port {port}...")
    print(f"     Mode: {ANALYSIS_MODE}\n")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
