/** A parsed subtitle cue — shared shape between SRT/VTT parser, API and player. */
export interface SubtitleCue {
  index: number;
  /** Start time in milliseconds. */
  startMs: number;
  /** End time in milliseconds. */
  endMs: number;
  /** Primary (English) line. */
  text: string;
  /** Optional translated (Vietnamese) line for bilingual display. */
  textVi?: string;
}

/** Per-word pronunciation score returned by Azure Pronunciation Assessment. */
export interface WordScore {
  word: string;
  accuracyScore: number;
  errorType: 'None' | 'Mispronunciation' | 'Omission' | 'Insertion';
}

/** Aggregated result of a speaking attempt. */
export interface SpeechAssessment {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronunciationScore: number;
  words: WordScore[];
}
