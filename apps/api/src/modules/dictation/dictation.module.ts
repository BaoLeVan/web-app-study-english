import { Module } from '@nestjs/common';
import { ProgressModule } from '../progress/progress.module';
import { DictationController } from './dictation.controller';
import { DictationService } from './dictation.service';

@Module({
  imports: [ProgressModule],
  controllers: [DictationController],
  providers: [DictationService],
  exports: [DictationService],
})
export class DictationModule {}
