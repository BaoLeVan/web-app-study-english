import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { CreateWordDto } from '@repo/types';
import { PrismaService } from '../../prisma/prisma.service';

interface ListOpts {
  search?: string;
  topicId?: string;
}

@Injectable()
export class VocabularyService {
  constructor(private readonly prisma: PrismaService) {}

  listTopics() {
    return this.prisma.topic.findMany({ orderBy: { name: 'asc' } });
  }

  async list(userId: string, opts: ListOpts) {
    const where: Prisma.UserWordWhereInput = { userId };
    if (opts.topicId) where.topicId = opts.topicId;
    if (opts.search) {
      where.OR = [
        { term: { contains: opts.search, mode: 'insensitive' } },
        { meaningVi: { contains: opts.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.userWord.findMany({
      where,
      include: { topic: true, schedule: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(userId: string, id: string) {
    const word = await this.prisma.userWord.findFirst({
      where: { id, userId },
      include: { topic: true, schedule: true },
    });
    if (!word) throw new NotFoundException('Word not found');
    return word;
  }

  /**
   * Idempotent on (userId, term): if the term is already in the user's
   * vocabulary, return the existing row instead of erroring. Matches the
   * "1-click add from subtitle" UX where the user shouldn't be punished
   * for clicking a familiar word.
   */
  async create(userId: string, dto: CreateWordDto) {
    const existing = await this.prisma.userWord.findUnique({
      where: { userId_term: { userId, term: dto.term } },
    });
    if (existing) return existing;

    return this.prisma.userWord.create({
      data: {
        userId,
        term: dto.term,
        ipa: dto.ipa,
        meaningVi: dto.meaningVi,
        imageUrl: dto.imageUrl,
        audioUrl: dto.audioUrl,
        context: dto.context,
        topicId: dto.topicId,
      },
    });
  }

  async delete(userId: string, id: string) {
    const found = await this.prisma.userWord.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException('Word not found');
    await this.prisma.userWord.delete({ where: { id } });
    return { ok: true };
  }
}
