'use client';

import type { SpeechAssessment } from '@repo/types';
import { GlassCard, Icon, ProgressBar } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ScoreCardProps {
  assessment: SpeechAssessment;
  referenceText: string;
}

const ERROR_LABEL: Record<string, string> = {
  Mispronunciation: 'Mispronounced',
  Omission: 'Skipped',
  Insertion: 'Extra word',
};

export function ScoreCard({ assessment, referenceText }: ScoreCardProps) {
  return (
    <GlassCard className="space-y-6 rounded-lg p-6" glow="primary">
      <div>
        <p className="font-label-bold uppercase tracking-wider text-outline">Overall score</p>
        <h2 className="font-display text-on-surface" style={{ fontSize: 44 }}>
          {Math.round(assessment.pronunciationScore)}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Metric label="Accuracy" value={assessment.accuracyScore} />
        <Metric label="Fluency" value={assessment.fluencyScore} />
        <Metric label="Completeness" value={assessment.completenessScore} />
      </div>

      <div>
        <p className="mb-2 font-label-bold uppercase tracking-wider text-outline">
          Word breakdown
        </p>
        <p className="font-body-lg leading-relaxed">
          {assessment.words.length > 0
            ? assessment.words.map((w, i) => (
                <WordChip key={i} word={w.word} score={w.accuracyScore} error={w.errorType} />
              ))
            : referenceText}
        </p>
      </div>
    </GlassCard>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const rounded = Math.round(value);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-label-sm uppercase tracking-wider text-outline">{label}</span>
        <span className="font-headline-md text-on-surface">{rounded}</span>
      </div>
      <ProgressBar value={rounded} height="sm" />
    </div>
  );
}

function WordChip({
  word,
  score,
  error,
}: {
  word: string;
  score: number;
  error: string;
}) {
  // Color by accuracy band. Insertion/Omission win out — they're structural.
  const tone =
    error === 'Omission' || error === 'Insertion' || error === 'Mispronunciation'
      ? 'error'
      : score >= 80
      ? 'ok'
      : score >= 60
      ? 'warn'
      : 'error';

  const tip =
    error !== 'None' ? `${ERROR_LABEL[error] ?? error}` : `${Math.round(score)}/100`;

  return (
    <span
      title={tip}
      className={cn(
        'mx-0.5 rounded px-1.5 py-0.5 font-body-lg',
        tone === 'ok' && 'bg-tertiary-fixed/50 text-on-surface',
        tone === 'warn' && 'bg-secondary-fixed/60 text-on-surface',
        tone === 'error' && 'bg-error-container/70 text-on-error-container',
      )}
    >
      {word}
    </span>
  );
}
