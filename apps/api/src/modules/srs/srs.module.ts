import { Module } from '@nestjs/common';
import { ProgressModule } from '../progress/progress.module';
import { SrsController } from './srs.controller';
import { SrsService } from './srs.service';

@Module({
  imports: [ProgressModule],
  controllers: [SrsController],
  providers: [SrsService],
  exports: [SrsService],
})
export class SrsModule {}
