'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useAuth } from '@/stores/auth';
import { dictationApi } from '@/lib/dictation-api';
import {
  hintMask,
  isCorrect,
  pickBlanks,
  tokenize,
  type Token,
} from '@/lib/dictation-logic';

interface FillInTheBlankProps {
  cueId: string;
  cueText: string;
  mode: 'WRITING' | 'LISTENING';
  /** Called after a correct submission is recorded. */
  onCorrect?: () => void;
  /** Seed for stable blank selection. Default: cueId hashcode. */
  seed?: number;
  /** Ratio of content words to blank out. Default: 0.3. */
  ratio?: number;
}

/**
 * Interactive fill-in-the-blank: hides ~30% of content words, user types
 * into each blank, validates locally, POSTs to /dictation/cues/:id on submit.
 * Provides a progressive Hint button that reveals one letter at a time.
 */
export function FillInTheBlank({
  cueId,
  cueText,
  mode,
  onCorrect,
  seed,
  ratio,
}: FillInTheBlankProps) {
  const token = useAuth((s) => s.accessToken)!;
  const tokens = tokenize(cueText);
  const blankIndices = pickBlanks(cueText, {
    ratio,
    seed: seed ?? hashCode(cueId),
  });

  // Local state: user inputs, hints used per blank, submission feedback
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [hintsUsed, setHintsUsed] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<Record<number, 'correct' | 'wrong'>>({});
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  const record = useMutation({
    mutationFn: (params: {
      blankIndex: number;
      expected: string;
      userInput: string;
      correct: boolean;
      hintsUsed: number;
    }) =>
      dictationApi.record(token, cueId, {
        ...params,
        mode,
      }),
  });

  const handleSubmit = async (blankIdx: number) => {
    const expected = tokens[blankIdx]!.text;
    const userInput = (inputs[blankIdx] ?? '').trim();
    const correct = isCorrect(expected, userInput);
    setFeedback((prev) => ({ ...prev, [blankIdx]: correct ? 'correct' : 'wrong' }));
    await record.mutateAsync({
      blankIndex: blankIdx,
      expected,
      userInput,
      correct,
      hintsUsed: hintsUsed[blankIdx] ?? 0,
    });
    if (correct) {
      onCorrect?.();
      // Auto-focus next blank if any remain
      const nextIdx = blankIndices.find((i) => i > blankIdx && !feedback[i]);
      if (nextIdx != null) {
        setTimeout(() => inputRefs.current.get(nextIdx)?.focus(), 100);
      }
    }
  };

  const handleHint = (blankIdx: number) => {
    const used = (hintsUsed[blankIdx] ?? 0) + 1;
    setHintsUsed((prev) => ({ ...prev, [blankIdx]: used }));
    const expected = tokens[blankIdx]!.text;
    const masked = hintMask(expected, used);
    setInputs((prev) => ({ ...prev, [blankIdx]: masked }));
    inputRefs.current.get(blankIdx)?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, blankIdx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit(blankIdx);
    }
  };

  useEffect(() => {
    // Auto-focus the first blank on mount
    const first = blankIndices[0];
    if (first != null) {
      setTimeout(() => inputRefs.current.get(first)?.focus(), 100);
    }
  }, [blankIndices]);

  return (
    <div className="space-y-4">
      <div className="leading-relaxed">
        {tokens.map((tok, i) => {
          if (!blankIndices.includes(i)) {
            return (
              <span key={i} className="font-body-lg text-on-surface">
                {tok.text}
              </span>
            );
          }
          const fb = feedback[i];
          const isSubmitted = fb != null;
          return (
            <span key={i} className="inline-block">
              <input
                ref={(el) => {
                  if (el) inputRefs.current.set(i, el);
                  else inputRefs.current.delete(i);
                }}
                type="text"
                value={inputs[i] ?? ''}
                onChange={(e) => setInputs((prev) => ({ ...prev, [i]: e.target.value }))}
                onKeyDown={(e) => handleKeyDown(e, i)}
                disabled={isSubmitted}
                className={cn(
                  'mx-1 rounded border-b-2 bg-transparent px-2 py-1 font-body-lg text-on-surface outline-none transition-colors',
                  !isSubmitted && 'border-outline focus:border-primary',
                  fb === 'correct' && 'border-tertiary bg-tertiary-fixed/30 text-tertiary',
                  fb === 'wrong' && 'border-error bg-error-container/30 text-error',
                )}
                style={{ width: `${Math.max(tok.text.length * 0.6, 3)}em` }}
                aria-label={`Blank ${blankIndices.indexOf(i) + 1}`}
              />
              {!isSubmitted && (
                <span className="ml-1 inline-flex gap-1">
                  <button
                    onClick={() => handleHint(i)}
                    className="rounded-full p-1 text-outline-variant hover:bg-surface-container-low"
                    title="Reveal one more letter"
                  >
                    <Icon name="lightbulb" style={{ fontSize: 16 }} />
                  </button>
                  <button
                    onClick={() => void handleSubmit(i)}
                    disabled={record.isPending}
                    className="rounded-full p-1 text-primary hover:bg-primary/10"
                    title="Submit this word"
                  >
                    <Icon name="check_circle" style={{ fontSize: 16 }} filled />
                  </button>
                </span>
              )}
            </span>
          );
        })}
      </div>
      {record.isError && (
        <p className="font-label-sm text-error">{(record.error as Error).message}</p>
      )}
    </div>
  );
}

/** Simple string hashCode for a stable numeric seed. */
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
  }
  return h >>> 0;
}
