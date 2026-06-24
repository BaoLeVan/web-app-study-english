import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { scoreSpeech } from './speech.scorer';

interface AssessDto {
  transcript: string;
  durationMs: number;
}

@Injectable()
export class SpeakingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
  ) {}

  recent(userId: string, limit = 20) {
    return this.prisma.speakingAttempt.findMany({
      where: { userId },
      include: { cue: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Compare a browser-produced transcript against the cue text, persist the
   * scored attempt. No audio bytes are stored — everything lives in WordScore
   * JSONB plus the four headline numbers.
   */
  async assessAndStore(userId: string, cueId: string, dto: AssessDto) {
    const cue = await this.prisma.subtitleCue.findUnique({ where: { id: cueId } });
    if (!cue) throw new NotFoundException('Cue not found');
    if (!dto.transcript || dto.transcript.trim().length === 0) {
      throw new BadRequestException('Empty transcript');
    }

    const assessment = scoreSpeech({
      referenceText: cue.text,
      transcript: dto.transcript,
      durationMs: dto.durationMs,
    });

    const attempt = await this.prisma.speakingAttempt.create({
      data: {
        userId,
        cueId,
        accuracyScore: assessment.accuracyScore,
        fluencyScore: assessment.fluencyScore,
        completenessScore: assessment.completenessScore,
        pronunciationScore: assessment.pronunciationScore,
        wordScores: assessment.words as unknown as object,
      },
    });

    // Speaking unlocks first_speak — evaluate after the attempt is persisted.
    await this.progress.evaluateAchievements(userId).catch(() => {});

    return { attempt, assessment };
  }
}
