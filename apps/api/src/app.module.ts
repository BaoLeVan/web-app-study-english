import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProgressModule } from './modules/progress/progress.module';
import { SrsModule } from './modules/srs/srs.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { ContentModule } from './modules/content/content.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { SpeechModule } from './modules/speech/speech.module';
import { DictationModule } from './modules/dictation/dictation.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Default ceiling for every non-decorated endpoint; auth controllers
    // override with stricter @Throttle decorators.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProgressModule,
    SrsModule,
    VocabularyModule,
    ContentModule,
    DictionaryModule,
    SpeechModule,
    DictationModule,
    NotificationsModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
