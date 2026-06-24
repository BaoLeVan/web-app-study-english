import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import type { Express } from 'express';
import { SpeakingService } from './speaking.service';
import { SpeechService } from './speech.service';

interface AuthedRequest {
  user: { userId: string };
}

@Controller('speaking')
@UseGuards(AuthGuard('jwt'))
export class SpeakingController {
  constructor(
    private readonly speaking: SpeakingService,
    private readonly speech: SpeechService,
  ) {}

  @Get('status')
  status() {
    return { azureConfigured: this.speech.isConfigured() };
  }

  @Get('attempts')
  recent(@Req() req: AuthedRequest) {
    return this.speaking.recent(req.user.userId);
  }

  @Post('cues/:cueId/assess')
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async assess(
    @Req() req: AuthedRequest,
    @Param('cueId') cueId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Missing audio file');
    return this.speaking.assessAndStore(req.user.userId, cueId, file.buffer);
  }
}
