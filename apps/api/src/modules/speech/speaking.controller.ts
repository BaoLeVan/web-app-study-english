import { Body, Controller, Get, Param, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { SpeakingService } from './speaking.service';

const AssessSchema = z.object({
  transcript: z.string().min(1).max(2000),
  durationMs: z.number().int().nonnegative().max(120_000),
});

interface AuthedRequest {
  user: { userId: string };
}

@Controller('speaking')
@UseGuards(AuthGuard('jwt'))
export class SpeakingController {
  constructor(private readonly speaking: SpeakingService) {}

  @Get('attempts')
  recent(@Req() req: AuthedRequest) {
    return this.speaking.recent(req.user.userId);
  }

  @Post('cues/:cueId/assess')
  @UsePipes(new ZodValidationPipe(AssessSchema))
  assess(
    @Req() req: AuthedRequest,
    @Param('cueId') cueId: string,
    @Body() dto: z.infer<typeof AssessSchema>,
  ) {
    return this.speaking.assessAndStore(req.user.userId, cueId, dto);
  }
}
