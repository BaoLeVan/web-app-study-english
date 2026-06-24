import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
}
