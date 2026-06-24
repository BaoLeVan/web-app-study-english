import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface DictionaryDef {
  term: string;
  ipa?: string;
  audioUrl?: string;
  definitions: Array<{
    partOfSpeech: string;
    definition: string;
    example?: string;
  }>;
}

/**
 * Thin proxy over dictionaryapi.dev (free, no key needed). We keep this
 * server-side so we can later swap in a paid provider (Oxford / Cambridge)
 * without touching the client.
 */
@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  async lookup(term: string): Promise<DictionaryDef> {
    const clean = term.trim().toLowerCase().replace(/[^a-z'-]/gi, '');
    if (!clean) throw new NotFoundException('Empty term');

    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`;
    let res: Response;
    try {
      res = await fetch(url);
    } catch (err) {
      this.logger.warn(`Dictionary fetch failed for ${clean}: ${String(err)}`);
      throw new NotFoundException('Dictionary lookup failed');
    }
    if (!res.ok) throw new NotFoundException('Word not found');

    // Shape from dictionaryapi.dev — narrow types here, no need for global interface.
    type Entry = {
      word: string;
      phonetic?: string;
      phonetics?: Array<{ text?: string; audio?: string }>;
      meanings?: Array<{
        partOfSpeech?: string;
        definitions?: Array<{ definition: string; example?: string }>;
      }>;
    };
    const entries = (await res.json()) as Entry[];
    const first = entries[0];
    if (!first) throw new NotFoundException('Word not found');

    const phonetic = first.phonetic ?? first.phonetics?.find((p) => p.text)?.text;
    const audio = first.phonetics?.find((p) => p.audio && p.audio.length > 0)?.audio;
    const definitions =
      first.meanings?.flatMap((m) =>
        (m.definitions ?? []).slice(0, 2).map((d) => ({
          partOfSpeech: m.partOfSpeech ?? '',
          definition: d.definition,
          example: d.example,
        })),
      ) ?? [];

    return {
      term: first.word,
      ipa: phonetic,
      audioUrl: audio,
      definitions: definitions.slice(0, 5),
    };
  }
}
