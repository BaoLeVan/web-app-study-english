import { Body, Controller, Get, Post, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { ReviewAnswerSchema, type ReviewAnswerDto } from '@repo/types';
import { SrsService } from './srs.service';

interface AuthedRequest {
  user: { userId: string };
}

@Controller('srs')
@UseGuards(AuthGuard('jwt'))
export class SrsController {
  constructor(private readonly srs: SrsService) {}

  @Get('queue')
  queue(@Req() req: AuthedRequest, @Query('newLimit') newLimit?: string) {
    return this.srs.getReviewQueue(req.user.userId, newLimit ? Number(newLimit) : 10);
  }

  @Post('review')
  @UsePipes(new ZodValidationPipe(ReviewAnswerSchema))
  submit(@Req() req: AuthedRequest, @Body() dto: ReviewAnswerDto) {
    return this.srs.submitReview(req.user.userId, dto.userWordId, dto.result);
  }
}
