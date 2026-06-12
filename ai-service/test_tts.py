"""
Test script to verify Edge TTS is working for all languages.
Run this after starting the AI service to confirm multi-language TTS.
"""

import asyncio
import sys

async def test_tts():
    try:
        import edge_tts
    except ImportError:
        print("❌ edge-tts not installed!")
        print("Run: pip install edge-tts")
        sys.exit(1)

    print("🔊 Testing Edge TTS for all languages...\n")

    # Test phrases for each language
    test_cases = [
        ("en-US", "Hello, how are you?", "en-US-JennyNeural"),
        ("es-ES", "Hola, ¿cómo estás?", "es-ES-ElviraNeural"),
        ("fr-FR", "Bonjour, comment allez-vous?", "fr-FR-DeniseNeural"),
        ("de-DE", "Guten Tag, wie geht es dir?", "de-DE-KatjaNeural"),
        ("it-IT", "Buongiorno, come stai?", "it-IT-ElsaNeural"),
        ("pt-BR", "Olá, como você está?", "pt-BR-FranciscaNeural"),
        ("hi-IN", "नमस्ते, आप कैसे हैं?", "hi-IN-SwaraNeural"),
        ("ja-JP", "こんにちは、お元気ですか？", "ja-JP-NanamiNeural"),
        ("zh-CN", "你好，你好吗？", "zh-CN-XiaoxiaoNeural"),
    ]

    success_count = 0
    failed = []

    for lang_code, text, voice in test_cases:
        try:
            communicate = edge_tts.Communicate(text, voice)
            
            # Test that we can start the stream (don't actually save audio)
            audio_generated = False
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_generated = True
                    break  # Just verify first chunk works
            
            if audio_generated:
                print(f"✅ {lang_code:8s} - {voice:25s} - Working")
                success_count += 1
            else:
                print(f"⚠️  {lang_code:8s} - {voice:25s} - No audio generated")
                failed.append(lang_code)
                
        except Exception as e:
            print(f"❌ {lang_code:8s} - {voice:25s} - Error: {str(e)[:40]}")
            failed.append(lang_code)

    print("\n" + "="*70)
    print(f"\n✅ {success_count}/{len(test_cases)} languages working")
    
    if failed:
        print(f"❌ Failed languages: {', '.join(failed)}")
        print("\nNote: Some failures may be due to network issues with Microsoft Edge TTS.")
        print("The app will still work - it will use browser voices as fallback.")
    else:
        print("\n🎉 All TTS voices working perfectly!")
        print("\nYou can now use the app with native pronunciation in all languages.")
    
    print("\nTo test in the app:")
    print("1. Make sure AI service is running: python main.py")
    print("2. Start backend: cd ../backend && npm run dev")
    print("3. Start frontend: cd .. && npm run dev")
    print("4. Open http://localhost:5173 and click 'Listen' button")

if __name__ == "__main__":
    try:
        asyncio.run(test_tts())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
