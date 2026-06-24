'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Wraps the browser-native Web Speech API (window.SpeechRecognition) to
 * give back a final transcript + how long the user spoke. The transcript
 * is what gets uploaded for scoring; no audio bytes leave the device.
 *
 * Browser support: Chrome / Edge / Safari (with webkit prefix). Firefox
 * still doesn't ship it — we expose `isSupported` so the UI can fall back
 * gracefully (recording-only, no scoring).
 */
export interface RecognitionState {
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
  /** Live partial transcript — updates while the user speaks. */
  interim: string;
  start: () => void;
  stop: () => Promise<{ transcript: string; durationMs: number } | null>;
  cancel: () => void;
}

type WebSpeechWindow = typeof window & {
  SpeechRecognition?: typeof window.SpeechRecognition;
  webkitSpeechRecognition?: typeof window.SpeechRecognition;
};

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

export function useSpeechRecognition(): RecognitionState {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interim, setInterim] = useState('');

  const finalRef = useRef('');
  const startedAtRef = useRef<number>(0);
  const recogRef = useRef<SpeechRecognition | null>(null);
  const stopResolverRef = useRef<
    ((value: { transcript: string; durationMs: number } | null) => void) | null
  >(null);

  const isSupported =
    typeof window !== 'undefined' &&
    !!((window as WebSpeechWindow).SpeechRecognition ||
      (window as WebSpeechWindow).webkitSpeechRecognition);

  const buildRecognizer = useCallback((): SpeechRecognition | null => {
    if (typeof window === 'undefined') return null;
    const w = window as WebSpeechWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return null;
    const recog = new Ctor();
    recog.lang = 'en-US';
    recog.continuous = true;
    recog.interimResults = true;
    return recog;
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      setError('SpeechRecognition not supported in this browser');
      return;
    }
    setError(null);
    setInterim('');
    finalRef.current = '';
    startedAtRef.current = performance.now();

    const recog = buildRecognizer();
    if (!recog) return;
    recogRef.current = recog;

    recog.onresult = (event: Event) => {
      const e = event as SpeechRecognitionEventLike;
      let interimChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]!;
        if (r.isFinal) finalRef.current += r[0]!.transcript + ' ';
        else interimChunk += r[0]!.transcript;
      }
      setInterim(interimChunk);
    };
    recog.onerror = (event: Event) => {
      const e = event as SpeechRecognitionErrorEventLike;
      // "no-speech" / "aborted" are not real errors — they're how stop() can land.
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setError(`Recognition error: ${e.error}`);
      }
    };
    recog.onend = () => {
      const durationMs = Math.round(performance.now() - startedAtRef.current);
      const transcript = finalRef.current.trim();
      setIsRecording(false);
      stopResolverRef.current?.({ transcript, durationMs });
      stopResolverRef.current = null;
    };

    try {
      recog.start();
      setIsRecording(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start recognition');
      setIsRecording(false);
    }
  }, [buildRecognizer, isSupported]);

  const stop = useCallback(async () => {
    const recog = recogRef.current;
    if (!recog || !isRecording) return null;
    // Resolve via onend so we capture the truly final transcript.
    return new Promise<{ transcript: string; durationMs: number } | null>((resolve) => {
      stopResolverRef.current = resolve;
      try {
        recog.stop();
      } catch {
        resolve(null);
      }
    });
  }, [isRecording]);

  const cancel = useCallback(() => {
    const recog = recogRef.current;
    if (recog) {
      try {
        recog.abort();
      } catch {
        /* ignore */
      }
    }
    stopResolverRef.current = null;
    setIsRecording(false);
    setInterim('');
    finalRef.current = '';
  }, []);

  useEffect(
    () => () => {
      recogRef.current?.abort();
    },
    [],
  );

  return { isRecording, isSupported, error, interim, start, stop, cancel };
}
