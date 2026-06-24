'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { usePlayerStore } from '@/stores/player';
import type { SubtitleCueRow } from '@/lib/content-api';
import { DictionaryPopover } from './DictionaryPopover';

interface InteractiveSubtitleProps {
  cues: SubtitleCueRow[];
  /** Show Vietnamese line under English when both are present. */
  bilingual?: boolean;
}

interface ClickedWord {
  word: string;
  context: string;
  rect: DOMRect;
}

/**
 * Click any word -> DictionaryPopover. Active cue (the one matching the
 * current player time) is highlighted and auto-scrolled into view.
 */
export function InteractiveSubtitle({ cues, bilingual }: InteractiveSubtitleProps) {
  const activeIdx = usePlayerStore((s) => s.activeCueIndex);
  const requestSeek = usePlayerStore((s) => s.requestSeek);
  const setPlaying = usePlayerStore((s) => s.setPlaying);

  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const [clicked, setClicked] = useState<ClickedWord | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIdx]);

  const onWordClick = (e: React.MouseEvent<HTMLSpanElement>, context: string) => {
    e.stopPropagation();
    const target = e.currentTarget;
    const raw = target.textContent ?? '';
    const word = raw.replace(/[^A-Za-z'-]/g, '');
    if (!word) return;
    setClicked({ word, context, rect: target.getBoundingClientRect() });
  };

  return (
    <>
      <div ref={listRef} className="max-h-[60vh] space-y-2 overflow-y-auto pr-2">
        {cues.map((cue, i) => {
          const isActive = i === activeIdx;
          return (
            <div
              key={cue.id}
              ref={isActive ? activeRef : null}
              className={cn(
                'cursor-pointer rounded-md px-4 py-3 transition-colors',
                isActive
                  ? 'bg-primary-fixed/60 ambient-glow-primary'
                  : 'hover:bg-surface-container-low',
              )}
              onClick={() => {
                requestSeek(cue.startMs);
                setPlaying(true);
              }}
            >
              <p className="font-body-lg leading-relaxed text-on-surface">
                {tokenize(cue.text).map((tok, j) =>
                  tok.isWord ? (
                    <span
                      key={j}
                      onClick={(e) => onWordClick(e, cue.text)}
                      className="cursor-pointer rounded px-0.5 hover:bg-primary/20 hover:text-primary"
                    >
                      {tok.text}
                    </span>
                  ) : (
                    <span key={j}>{tok.text}</span>
                  ),
                )}
              </p>
              {bilingual && cue.textVi && (
                <p className="mt-1 font-body-md italic text-outline">{cue.textVi}</p>
              )}
            </div>
          );
        })}
      </div>

      {clicked && (
        <DictionaryPopover
          word={clicked.word}
          context={clicked.context}
          anchorRect={clicked.rect}
          onClose={() => setClicked(null)}
        />
      )}
    </>
  );
}

interface Token {
  text: string;
  isWord: boolean;
}

/**
 * Split a cue into clickable words + non-word fragments so spacing /
 * punctuation render unchanged. A "word" is any run of letters with
 * optional apostrophes (don't, world's).
 */
function tokenize(text: string): Token[] {
  const out: Token[] = [];
  const re = /[A-Za-z][A-Za-z'-]*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), isWord: false });
    out.push({ text: m[0]!, isWord: true });
    last = m.index + m[0]!.length;
  }
  if (last < text.length) out.push({ text: text.slice(last), isWord: false });
  return out;
}
