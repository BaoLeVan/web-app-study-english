import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateWordSchema, type CreateWordDto } from '@repo/types';
import { VocabularyService } from './vocabulary.service';

interface AuthedRequest {
  user: { userId: string };
}

@Controller('vocabulary')
@UseGuards(AuthGuard('jwt'))
export class VocabularyController {
  constructor(private readonly vocab: VocabularyService) {}

  @Get('topics')
  topics() {
    return this.vocab.listTopics();
  }

  @Get('words')
  list(
    @Req() req: AuthedRequest,
    @Query('search') search?: string,
    @Query('topicId') topicId?: string,
  ) {
    return this.vocab.list(req.user.userId, { search, topicId });
  }

  @Get('words/:id')
  get(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.vocab.get(req.user.userId, id);
  }

  @Post('words')
  @UsePipes(new ZodValidationPipe(CreateWordSchema))
  create(@Req() req: AuthedRequest, @Body() dto: CreateWordDto) {
    return this.vocab.create(req.user.userId, dto);
  }

  @Delete('words/:id')
  remove(@Req() req: AuthedRequest, @Param('id') id: string) {
    return this.vocab.delete(req.user.userId, id);
  }
}
