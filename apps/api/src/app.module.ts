import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProgressModule } from './modules/progress/progress.module';
import { SrsModule } from './modules/srs/srs.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { ContentModule } from './modules/content/content.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProgressModule,
    SrsModule,
    VocabularyModule,
    ContentModule,
    DictionaryModule,
    NotificationsModule,
  ],
})
export class AppModule {}
