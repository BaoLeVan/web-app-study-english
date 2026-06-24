import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SpeechService } from './speech.service';

@Injectable()
export class SpeakingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly speech: SpeechService,
  ) {}

  /** List recent speaking attempts for a user (most recent first). */
  recent(userId: string, limit = 20) {
    return this.prisma.speakingAttempt.findMany({
      where: { userId },
      include: { cue: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Score a recording against the cue's reference text, persist the result.
   * We deliberately do NOT store the audio bytes in the DB — only the score.
   * (Object-storage upload comes in a later sprint; for v1 keep DB lean.)
   */
  async assessAndStore(userId: string, cueId: string, audio: Buffer) {
    const cue = await this.prisma.subtitleCue.findUnique({ where: { id: cueId } });
    if (!cue) throw new NotFoundException('Cue not found');
    if (audio.byteLength === 0) throw new BadRequestException('Empty audio');

    const assessment = await this.speech.assess(audio, cue.text);

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

    return { attempt, assessment };
  }
}
