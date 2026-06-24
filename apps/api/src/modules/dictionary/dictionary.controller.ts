import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DictionaryService } from './dictionary.service';

@Controller('dictionary')
@UseGuards(AuthGuard('jwt'))
export class DictionaryController {
  constructor(private readonly dictionary: DictionaryService) {}

  @Get('lookup')
  lookup(@Query('term') term: string) {
    return this.dictionary.lookup(term);
  }
}
