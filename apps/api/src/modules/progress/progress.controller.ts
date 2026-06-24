import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service';

interface AuthedRequest {
  user: { userId: string };
}

@Controller('progress')
@UseGuards(AuthGuard('jwt'))
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.progress.getSummary(req.user.userId);
  }

  @Get('series')
  series(@Req() req: AuthedRequest, @Query('days') days?: string) {
    const n = days ? Math.min(Math.max(parseInt(days, 10), 1), 365) : 30;
    return this.progress.getSeries(req.user.userId, n);
  }
}
