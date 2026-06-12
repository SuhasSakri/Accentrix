import { useState, useEffect, useCallback } from 'react';

function normalizeLang(lang) {
  return (lang || '').replace('_', '-').toLowerCase();
}

export function pickVoiceForLang(voices, langCode) {
  if (!voices?.length || !langCode) return null;

  const target = normalizeLang(langCode);
  const prefix = target.split('-')[0];

  const langOf = (voice) => normalizeLang(voice.lang);

  // Exact match: es-es
  let match = voices.find((v) => langOf(v) === target);
  if (match) return match;

  // Same language, any region: es-mx, es-us, etc.
  match = voices.find((v) => langOf(v).startsWith(`${prefix}-`));
  if (match) return match;

  // Prefix only: es
  match = voices.find((v) => langOf(v) === prefix || langOf(v).startsWith(`${prefix}-`));
  return match ?? null;
}

/**
 * Loads browser TTS voices and speaks text with a voice matched to the language.
 */
export function useSpeechVoices() {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const speak = useCallback(
    (text, langCode) => {
      const trimmed = text?.trim();
      if (!trimmed) return { spoken: false, voiceFound: false };

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = langCode;

      const voice = pickVoiceForLang(voices, langCode);
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.cancel();

      // Chrome on Windows often ignores speak() if called immediately after cancel
      window.setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);

      return { spoken: true, voiceFound: !!voice };
    },
    [voices]
  );

  return { voices, speak };
}
