import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { IngestContentSchema, type IngestContentDto } from '@repo/types';
import { ContentService } from './content.service';

const AttachSubtitleSchema = z.object({
  lang: z.enum(['en', 'vi']).default('en'),
  raw: z.string().min(10, 'Subtitle file looks empty'),
});

interface AuthedRequest {
  user: { userId: string };
}

@Controller('content')
@UseGuards(AuthGuard('jwt'))
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.content.list(req.user.userId);
  }

  @Get(':id')
  get(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.content.get(req.user.userId, id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(IngestContentSchema))
  ingest(@Req() req: AuthedRequest, @Body() dto: IngestContentDto) {
    return this.content.ingest(req.user.userId, dto);
  }

  @Post(':id/subtitle')
  @UsePipes(new ZodValidationPipe(AttachSubtitleSchema))
  attach(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: { lang: 'en' | 'vi'; raw: string },
  ) {
    return this.content.attachSubtitle(req.user.userId, id, dto.lang, dto.raw);
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.content.remove(req.user.userId, id);
  }
}
