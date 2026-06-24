import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { nextStreak } from './progress.streak';
import { bucketByDay, dayKeysBetween, startOfDay } from './progress.series';
import { evaluate } from './achievement.rules';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const [progress, totalWords, dueCount, achievements] = await Promise.all([
      this.prisma.progress.findUnique({ where: { userId } }),
      this.prisma.userWord.count({ where: { userId } }),
      this.prisma.reviewSchedule.count({
        where: { nextReviewAt: { lte: new Date() }, userWord: { userId } },
      }),
      this.prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
      }),
    ]);

    return {
      lessonsDone: progress?.lessonsDone ?? 0,
      wordsLearned: progress?.wordsLearned ?? 0,
      currentStreak: progress?.currentStreak ?? 0,
      longestStreak: progress?.longestStreak ?? 0,
      totalPoints: progress?.totalPoints ?? 0,
      totalWords,
      dueCount,
      achievements: achievements.map((a) => ({
        code: a.achievement.code,
        title: a.achievement.title,
        description: a.achievement.description,
        icon: a.achievement.icon,
        unlockedAt: a.unlockedAt,
      })),
    };
  }

  /**
   * Daily activity series for the last `days` days. Used by /progress charts:
   * reviews driving the SRS line, dictation+speaking the writing/speaking line.
   */
  async getSeries(userId: string, days = 30) {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - (days - 1));
    const fromStart = startOfDay(from);
    const keys = dayKeysBetween(fromStart, today);

    const [reviews, dictations, speaking] = await Promise.all([
      this.prisma.reviewSchedule.findMany({
        where: { userWord: { userId }, lastReviewAt: { gte: fromStart } },
        select: { lastReviewAt: true },
      }),
      this.prisma.dictationAttempt.findMany({
        where: { userId, createdAt: { gte: fromStart } },
        select: { createdAt: true, correct: true },
      }),
      this.prisma.speakingAttempt.findMany({
        where: { userId, createdAt: { gte: fromStart } },
        select: { createdAt: true },
      }),
    ]);

    const reviewBucket = bucketByDay(
      reviews
        .filter((r): r is { lastReviewAt: Date } => r.lastReviewAt != null)
        .map((r) => ({ createdAt: r.lastReviewAt })),
      keys,
    );
    const dictationBucket = bucketByDay(dictations, keys);
    const speakingBucket = bucketByDay(speaking, keys);

    return {
      days: keys.map((k) => ({
        day: k,
        reviews: reviewBucket[k] ?? 0,
        dictation: dictationBucket[k] ?? 0,
        speaking: speakingBucket[k] ?? 0,
      })),
    };
  }

  /**
   * Apply a review's side-effects to Progress: bump points, increment
   * wordsLearned the first time a word is marked REMEMBERED, advance the
   * streak if this is the first review today.
   */
  async recordReview(
    userId: string,
    opts: { result: 'REMEMBERED' | 'FORGOT'; firstRemember: boolean },
  ) {
    const existing = await this.prisma.progress.findUnique({ where: { userId } });
    const now = new Date();
    const streak = nextStreak(
      { currentStreak: existing?.currentStreak ?? 0, lastActiveAt: existing?.lastActiveAt ?? null },
      now,
    );
    const longest = Math.max(existing?.longestStreak ?? 0, streak);
    const pointsDelta = opts.result === 'REMEMBERED' ? 10 : 2;

    const result = await this.prisma.progress.upsert({
      where: { userId },
      create: {
        userId,
        lessonsDone: 0,
        wordsLearned: opts.firstRemember ? 1 : 0,
        currentStreak: streak,
        longestStreak: streak,
        totalPoints: pointsDelta,
        lastActiveAt: now,
      },
      update: {
        wordsLearned: opts.firstRemember
          ? { increment: 1 }
          : (existing?.wordsLearned ?? 0),
        currentStreak: streak,
        longestStreak: longest,
        totalPoints: { increment: pointsDelta },
        lastActiveAt: now,
      },
    });

    // Fire-and-forget achievement check — failure here shouldn't roll back
    // the review itself.
    await this.evaluateAchievements(userId).catch(() => {});
    return result;
  }

  /**
   * Snapshot the user's stats, evaluate every rule, and persist any newly
   * satisfied ones as UserAchievement rows. Idempotent — already-unlocked
   * achievements are skipped by the unique (userId, achievementId) constraint.
   */
  async evaluateAchievements(userId: string) {
    const [progress, speaking, dictation] = await Promise.all([
      this.prisma.progress.findUnique({ where: { userId } }),
      this.prisma.speakingAttempt.count({ where: { userId } }),
      this.prisma.dictationAttempt.count({ where: { userId, correct: true } }),
    ]);

    const codes = evaluate({
      wordsLearned: progress?.wordsLearned ?? 0,
      currentStreak: progress?.currentStreak ?? 0,
      totalPoints: progress?.totalPoints ?? 0,
      speakingAttempts: speaking,
      dictationCorrect: dictation,
    });
    if (codes.length === 0) return [];

    const achievements = await this.prisma.achievement.findMany({
      where: { code: { in: codes } },
    });
    const already = await this.prisma.userAchievement.findMany({
      where: { userId, achievementId: { in: achievements.map((a) => a.id) } },
      select: { achievementId: true },
    });
    const alreadySet = new Set(already.map((a) => a.achievementId));
    const toInsert = achievements
      .filter((a) => !alreadySet.has(a.id))
      .map((a) => ({ userId, achievementId: a.id }));

    if (toInsert.length === 0) return [];
    await this.prisma.userAchievement.createMany({
      data: toInsert,
      skipDuplicates: true,
    });
    return achievements
      .filter((a) => !alreadySet.has(a.id))
      .map((a) => a.code);
  }
}
