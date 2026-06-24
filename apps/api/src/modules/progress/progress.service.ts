import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { nextStreak } from './progress.streak';

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

    return this.prisma.progress.upsert({
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
  }
}
