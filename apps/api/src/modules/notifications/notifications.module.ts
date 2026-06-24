import { Module } from '@nestjs/common';
import { NotificationsScheduler } from './notifications.scheduler';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [NotificationsService, NotificationsScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}
