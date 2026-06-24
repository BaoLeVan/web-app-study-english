import { Body, Controller, Get, Param, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { DictationService } from './dictation.service';

const RecordSchema = z.object({
  blankIndex: z.number().int().nonnegative(),
  expected: z.string().min(1).max(100),
  userInput: z.string().max(100),
  correct: z.boolean(),
  hintsUsed: z.number().int().nonnegative().max(10),
  mode: z.enum(['WRITING', 'LISTENING']),
});

interface AuthedRequest {
  user: { userId: string };
}

@Controller('dictation')
@UseGuards(AuthGuard('jwt'))
export class DictationController {
  constructor(private readonly dictation: DictationService) {}

  @Get('attempts')
  recent(@Req() req: AuthedRequest) {
    return this.dictation.recent(req.user.userId);
  }

  @Get('content/:contentId/accuracy')
  accuracy(@Req() req: AuthedRequest, @Param('contentId') contentId: string) {
    return this.dictation.accuracy(req.user.userId, contentId);
  }

  @Post('cues/:cueId')
  @UsePipes(new ZodValidationPipe(RecordSchema))
  record(
    @Req() req: AuthedRequest,
    @Param('cueId') cueId: string,
    @Body() dto: z.infer<typeof RecordSchema>,
  ) {
    return this.dictation.record(req.user.userId, cueId, dto);
  }
}
