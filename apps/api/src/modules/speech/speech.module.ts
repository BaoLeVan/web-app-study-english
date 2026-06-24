import { Module } from '@nestjs/common';
import { ProgressModule } from '../progress/progress.module';
import { SpeakingController } from './speaking.controller';
import { SpeakingService } from './speaking.service';

@Module({
  imports: [ProgressModule],
  controllers: [SpeakingController],
  providers: [SpeakingService],
  exports: [SpeakingService],
})
export class SpeechModule {}
