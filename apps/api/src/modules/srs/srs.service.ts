import { Injectable } from '@nestjs/common';
import type { ReviewResult } from '@repo/types';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { addDays, computeSrs } from './srs.algorithm';

@Injectable()
export class SrsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
  ) {}

  /**
   * Build today's review queue: due "FORGOT"/scheduled words first, then new
   * words interleaved — matching the plan's "đan xen từ Quên với từ mới".
   */
  async getReviewQueue(userId: string, newLimit = 10) {
    const now = new Date();

    const due = await this.prisma.userWord.findMany({
      where: { userId, schedule: { nextReviewAt: { lte: now } } },
      include: { schedule: true },
      orderBy: [{ schedule: { lastResult: 'asc' } }, { schedule: { nextReviewAt: 'asc' } }],
    });

    const fresh = await this.prisma.userWord.findMany({
      where: { userId, schedule: { is: null } },
      take: newLimit,
    });

    return this.interleave(due, fresh);
  }

  /** Record a review answer and advance the SRS schedule for that word. */
  async submitReview(userId: string, userWordId: string, result: ReviewResult) {
    const word = await this.prisma.userWord.findFirst({
      where: { id: userWordId, userId },
      include: { schedule: true },
    });
    if (!word) throw new Error('Word not found');

    const prev = word.schedule ?? { intervalDays: 0, easeFactor: 2.5, repetitions: 0 };
    const next = computeSrs(prev, result);
    const nextReviewAt = addDays(new Date(), next.intervalDays);

    // A word is "newly learned" the first time it goes from no-schedule to
    // REMEMBERED — that's when we credit Progress.wordsLearned.
    const firstRemember = !word.schedule && result === 'REMEMBERED';

    const [schedule] = await this.prisma.$transaction([
      this.prisma.reviewSchedule.upsert({
        where: { userWordId },
        create: {
          userWordId,
          intervalDays: next.intervalDays,
          easeFactor: next.easeFactor,
          repetitions: next.repetitions,
          nextReviewAt,
          lastResult: result,
          lastReviewAt: new Date(),
        },
        update: {
          intervalDays: next.intervalDays,
          easeFactor: next.easeFactor,
          repetitions: next.repetitions,
          nextReviewAt,
          lastResult: result,
          lastReviewAt: new Date(),
        },
      }),
    ]);

    await this.progress.recordReview(userId, { result, firstRemember });
    return schedule;
  }

  /** Round-robin interleave so new words are spread through the due ones. */
  private interleave<T>(a: T[], b: T[]): T[] {
    const out: T[] = [];
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      if (i < a.length) out.push(a[i]!);
      if (i < b.length) out.push(b[i]!);
    }
    return out;
  }
}
