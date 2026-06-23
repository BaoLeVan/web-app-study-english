import { z } from 'zod';
import { CEFR_LEVELS, REVIEW_RESULTS } from './enums';

/** Auth */
export const RegisterSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

/** User settings — incl. daily reminder time for spaced-repetition push. */
export const UpdateSettingsSchema = z.object({
  nativeLang: z.string().min(2).max(10).optional(),
  level: z.enum(CEFR_LEVELS).optional(),
  /** Local time "HH:mm" the daily review reminder fires. */
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be HH:mm')
    .optional(),
  notificationsEnabled: z.boolean().optional(),
});
export type UpdateSettingsDto = z.infer<typeof UpdateSettingsSchema>;

/** Vocabulary */
export const CreateWordSchema = z.object({
  term: z.string().min(1).max(100),
  ipa: z.string().max(100).optional(),
  meaningVi: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  context: z.string().max(1000).optional(),
  topicId: z.string().cuid().optional(),
  /** Optional link back to the subtitle cue the word was captured from. */
  sourceCueId: z.string().cuid().optional(),
});
export type CreateWordDto = z.infer<typeof CreateWordSchema>;

/** A single review answer the client sends back to the SRS engine. */
export const ReviewAnswerSchema = z.object({
  userWordId: z.string().cuid(),
  result: z.enum(REVIEW_RESULTS),
});
export type ReviewAnswerDto = z.infer<typeof ReviewAnswerSchema>;

/** Content ingestion — paste a YouTube link or register an uploaded file. */
export const IngestContentSchema = z
  .object({
    title: z.string().min(1).max(200),
    type: z.enum(['YOUTUBE', 'UPLOAD']),
    youtubeUrl: z.string().url().optional(),
    fileKey: z.string().optional(),
    level: z.enum(CEFR_LEVELS).optional(),
  })
  .refine((d) => (d.type === 'YOUTUBE' ? !!d.youtubeUrl : !!d.fileKey), {
    message: 'youtubeUrl required for YOUTUBE, fileKey required for UPLOAD',
  });
export type IngestContentDto = z.infer<typeof IngestContentSchema>;

/** Web Push subscription payload (from the browser PushManager). */
export const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});
export type PushSubscriptionDto = z.infer<typeof PushSubscriptionSchema>;
