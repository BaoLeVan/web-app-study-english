import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { IngestContentDto } from '@repo/types';
import { PrismaService } from '../../prisma/prisma.service';
import { parseSubtitle } from './subtitle.parser';
import { extractYouTubeId } from './youtube';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.content.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { cues: true } } },
    });
  }

  async get(userId: string, id: string) {
    const content = await this.prisma.content.findFirst({
      where: { id, ownerId: userId },
      include: {
        cues: { orderBy: { index: 'asc' } },
        subtitles: true,
      },
    });
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async ingest(userId: string, dto: IngestContentDto) {
    if (dto.type === 'YOUTUBE') {
      const ytId = extractYouTubeId(dto.youtubeUrl!);
      if (!ytId) throw new BadRequestException('Invalid YouTube URL');
      const canonical = `https://www.youtube.com/watch?v=${ytId}`;
      return this.prisma.content.create({
        data: {
          ownerId: userId,
          title: dto.title,
          type: 'YOUTUBE',
          youtubeUrl: canonical,
          level: dto.level ?? 'BEGINNER',
        },
      });
    }
    return this.prisma.content.create({
      data: {
        ownerId: userId,
        title: dto.title,
        type: 'UPLOAD',
        fileKey: dto.fileKey!,
        level: dto.level ?? 'BEGINNER',
      },
    });
  }

  /**
   * Replace the cue list for a content's subtitle in `lang`. Idempotent: each
   * (contentId, lang) has exactly one Subtitle row, and re-uploading wipes
   * old cues so an updated SRT cleanly supersedes the previous one.
   */
  async attachSubtitle(userId: string, contentId: string, lang: string, raw: string) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, ownerId: userId },
    });
    if (!content) throw new NotFoundException('Content not found');

    const cues = parseSubtitle(raw);
    if (cues.length === 0) throw new BadRequestException('Subtitle file has no usable cues');

    await this.prisma.subtitle.upsert({
      where: { contentId_lang: { contentId, lang } },
      create: { contentId, lang },
      update: {},
    });

    await this.prisma.$transaction([
      this.prisma.subtitleCue.deleteMany({ where: { contentId } }),
      this.prisma.subtitleCue.createMany({
        data: cues.map((c) => ({
          contentId,
          index: c.index,
          startMs: c.startMs,
          endMs: c.endMs,
          text: c.text,
        })),
      }),
    ]);

    const lastEnd = cues[cues.length - 1]!.endMs;
    if (!content.durationMs || lastEnd > content.durationMs) {
      await this.prisma.content.update({
        where: { id: contentId },
        data: { durationMs: lastEnd },
      });
    }

    return { cueCount: cues.length };
  }

  async remove(userId: string, id: string) {
    const found = await this.prisma.content.findFirst({ where: { id, ownerId: userId } });
    if (!found) throw new NotFoundException('Content not found');
    await this.prisma.content.delete({ where: { id } });
    return { ok: true };
  }
}
