import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';

interface RecordDto {
  /** Token index inside the cue. */
  blankIndex: number;
  expected: string;
  userInput: string;
  correct: boolean;
  hintsUsed: number;
  mode: 'WRITING' | 'LISTENING';
}

@Injectable()
export class DictationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
  ) {}

  /**
   * Persist a single fill-in-the-blank answer. We rely on the client to
   * decide correctness (the validator is pure and small) and just trust
   * what it sends — server still records the raw `userInput` so we could
   * re-grade later if needed.
   */
  async record(userId: string, cueId: string, dto: RecordDto) {
    if (dto.userInput == null) throw new BadRequestException('Missing userInput');
    const cue = await this.prisma.subtitleCue.findUnique({ where: { id: cueId } });
    if (!cue) throw new NotFoundException('Cue not found');

    const attempt = await this.prisma.dictationAttempt.create({
      data: {
        userId,
        cueId,
        mode: dto.mode,
        userInput: dto.userInput,
        correct: dto.correct,
        hintsUsed: dto.hintsUsed,
      },
    });

    // Progress reward: full credit only when correct AND no hints; half credit
    // otherwise. We deliberately do NOT inflate wordsLearned here — that's an
    // SRS concept and dictation lives outside the spaced-repetition loop.
    if (dto.correct) {
      await this.progress.recordReview(userId, {
        result: dto.hintsUsed === 0 ? 'REMEMBERED' : 'FORGOT',
        firstRemember: false,
      });
    }

    return attempt;
  }

  recent(userId: string, limit = 20) {
    return this.prisma.dictationAttempt.findMany({
      where: { userId },
      include: { cue: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /** Per-content accuracy summary for the user — used by dashboards. */
  async accuracy(userId: string, contentId: string) {
    const cues = await this.prisma.subtitleCue.findMany({
      where: { contentId },
      select: { id: true },
    });
    if (cues.length === 0) return { total: 0, correct: 0 };
    const cueIds = cues.map((c) => c.id);
    const result = await this.prisma.dictationAttempt.aggregate({
      where: { userId, cueId: { in: cueIds } },
      _count: { _all: true },
    });
    const correct = await this.prisma.dictationAttempt.count({
      where: { userId, cueId: { in: cueIds }, correct: true },
    });
    void Prisma; // keep prisma typings happy if unused
    return { total: result._count._all, correct };
  }
}
