import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

interface AuthedRequest {
  user: { userId: string };
}

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('test')
  test(@Req() req: AuthedRequest) {
    return this.notifications.sendTest(req.user.userId);
  }
}
