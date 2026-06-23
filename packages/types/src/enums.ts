/** Shared enums & constants for LinguoFlow (used by both web and api). */

export const CEFR_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type Level = (typeof CEFR_LEVELS)[number];

export const CONTENT_TYPES = ['YOUTUBE', 'UPLOAD'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const SUBTITLE_LANGS = ['en', 'vi'] as const;
export type SubtitleLang = (typeof SUBTITLE_LANGS)[number];

/** Result the user reports during a vocabulary review (drives the SRS schedule). */
export const REVIEW_RESULTS = ['REMEMBERED', 'FORGOT'] as const;
export type ReviewResult = (typeof REVIEW_RESULTS)[number];

/** Practice modes that reuse the shared VideoPlayer + InteractiveSubtitle. */
export const PRACTICE_MODES = ['SPEAKING', 'LISTENING', 'WRITING'] as const;
export type PracticeMode = (typeof PRACTICE_MODES)[number];
