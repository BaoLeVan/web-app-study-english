import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

/**
 * Every minute, find users whose local reminder time matches "now" (using
 * their stored "HH:mm" — for v1 we assume server-local; future work: store
 * IANA timezone alongside reminder time). For each match, count due words
 * and fire one push if there are any.
 */
@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const candidates = await this.prisma.userSettings.findMany({
      where: { reminderTime: hhmm, notificationsEnabled: true },
      select: { userId: true },
    });
    if (candidates.length === 0) return;

    for (const { userId } of candidates) {
      const dueCount = await this.prisma.reviewSchedule.count({
        where: { nextReviewAt: { lte: now }, userWord: { userId } },
      });
      if (dueCount > 0) {
        await this.notifications.sendReviewReminder(userId, dueCount);
      }
    }
  }
}
