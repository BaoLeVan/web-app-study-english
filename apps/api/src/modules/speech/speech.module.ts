import { Module } from '@nestjs/common';
import { SpeakingController } from './speaking.controller';
import { SpeakingService } from './speaking.service';
import { SpeechService } from './speech.service';

@Module({
  controllers: [SpeakingController],
  providers: [SpeechService, SpeakingService],
  exports: [SpeechService, SpeakingService],
})
export class SpeechModule {}
