'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Icon } from '@/components/ui';
import { useAuth } from '@/stores/auth';
import { dictionaryApi } from '@/lib/content-api';
import { vocabularyApi } from '@/lib/vocabulary-api';

interface DictionaryPopoverProps {
  word: string;
  context?: string;
  anchorRect: DOMRect;
  onClose: () => void;
}

/**
 * Pop-up dictionary: looks up the clicked word and offers a 1-click
 * "Add to my words". Anchored to the clicked word's bounding rect.
 */
export function DictionaryPopover({
  word,
  context,
  anchorRect,
  onClose,
}: DictionaryPopoverProps) {
  const token = useAuth((s) => s.accessToken)!;
  const ref = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);

  const lookup = useQuery({
    queryKey: ['dictionary', word],
    queryFn: () => dictionaryApi.lookup(token, word),
    retry: false,
  });

  const add = useMutation({
    mutationFn: () =>
      vocabularyApi.create(token, {
        term: word,
        ipa: lookup.data?.ipa,
        meaningVi: lookup.data?.definitions[0]?.definition ?? word,
        audioUrl: lookup.data?.audioUrl,
        context,
      }),
    onSuccess: () => setAdded(true),
  });

  // Close on outside click / Escape.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Position below the word, clamped to viewport.
  const top = Math.min(window.innerHeight - 340, anchorRect.bottom + 8);
  const left = Math.min(window.innerWidth - 340, Math.max(8, anchorRect.left));

  return (
    <div
      ref={ref}
      role="dialog"
      className="fixed z-50 w-80 rounded-lg border border-white/60 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
      style={{ top, left }}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-headline-md text-on-surface">{word}</h3>
          {lookup.data?.ipa && (
            <p className="font-label-sm text-outline-variant">{lookup.data.ipa}</p>
          )}
        </div>
        <div className="flex gap-1">
          {lookup.data?.audioUrl && (
            <button
              onClick={() => new Audio(lookup.data!.audioUrl!).play()}
              className="rounded-full p-1.5 text-primary hover:bg-surface-container-low"
              aria-label="Play pronunciation"
            >
              <Icon name="volume_up" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-outline hover:bg-surface-container-low"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>
      </div>

      {lookup.isLoading && (
        <p className="font-body-md text-outline">Looking up…</p>
      )}
      {lookup.isError && (
        <p className="font-body-md text-outline">
          No definition found. You can still add this word manually.
        </p>
      )}
      {lookup.data && (
        <ul className="mb-4 max-h-40 space-y-2 overflow-y-auto pr-1">
          {lookup.data.definitions.map((d, i) => (
            <li key={i} className="border-l-2 border-primary/30 pl-3">
              <p className="font-label-bold uppercase tracking-wider text-outline">
                {d.partOfSpeech}
              </p>
              <p className="font-body-md text-on-surface">{d.definition}</p>
              {d.example && (
                <p className="mt-1 font-label-sm italic text-outline-variant">
                  "{d.example}"
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {added ? (
        <div className="flex items-center gap-2 rounded-full bg-tertiary-fixed/40 px-4 py-2 font-label-bold text-tertiary">
          <Icon name="check" />
          Added to your store
        </div>
      ) : (
        <Button
          onClick={() => add.mutate()}
          disabled={add.isPending}
          size="sm"
          className="w-full"
        >
          <Icon name="add" />
          {add.isPending ? 'Adding…' : 'Add to my words'}
        </Button>
      )}
    </div>
  );
}
