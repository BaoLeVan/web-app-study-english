import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private configured = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const pub = process.env.VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT ?? 'mailto:admin@linguoflow.app';
    if (pub && priv) {
      webpush.setVapidDetails(subject, pub, priv);
      this.configured = true;
    } else {
      this.logger.warn('VAPID keys not set — push notifications disabled.');
    }
  }

  /**
   * Send a review-reminder push to a single user. Silently drops if the user
   * has no subscription or VAPID isn't configured — failure here should never
   * break the scheduler tick.
   */
  async sendReviewReminder(userId: string, dueCount: number) {
    if (!this.configured) return;
    const settings = await this.prisma.userSettings.findUnique({ where: { userId } });
    if (!settings?.notificationsEnabled || !settings.pushSubscription) return;

    const payload = JSON.stringify({
      title: 'Time to review!',
      body: `${dueCount} word${dueCount === 1 ? '' : 's'} ready for review.`,
      url: '/vocabulary',
    });

    try {
      await webpush.sendNotification(settings.pushSubscription as unknown as webpush.PushSubscription, payload);
    } catch (err) {
      this.logger.warn(`Push failed for ${userId}: ${String(err)}`);
    }
  }
}
