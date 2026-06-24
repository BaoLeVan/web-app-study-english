import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import type { SpeechAssessment, WordScore } from '@repo/types';

/**
 * Azure Pronunciation Assessment wrapper.
 *
 * Audio contract (v1): the web client encodes its MediaRecorder capture to
 * 16 kHz / 16-bit / mono PCM WAV (see useRecorder on the frontend) before
 * uploading. We forward those bytes straight to Azure via a push stream
 * declared as 16 kHz PCM. This sidesteps the Node SDK's WebM/Opus codepath,
 * which requires a GStreamer binary we don't want to ship in the API image.
 */
@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name);

  private get config() {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;
    if (!key || !region) return null;
    return { key, region };
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  async assess(audio: Buffer, referenceText: string): Promise<SpeechAssessment> {
    const cfg = this.config;
    if (!cfg) throw new ServiceUnavailableException('Azure Speech not configured');

    const speechConfig = sdk.SpeechConfig.fromSubscription(cfg.key, cfg.region);
    speechConfig.speechRecognitionLanguage = 'en-US';

    const format = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = sdk.AudioInputStream.createPushStream(format);
    // ArrayBuffer slice copies; that's intentional so we own the underlying memory.
    const ab = new ArrayBuffer(audio.byteLength);
    new Uint8Array(ab).set(audio);
    pushStream.write(ab);
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const paConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true,
    );

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    paConfig.applyTo(recognizer);

    try {
      const result = await new Promise<sdk.SpeechRecognitionResult>((resolve, reject) => {
        recognizer.recognizeOnceAsync(resolve, reject);
      });
      return this.parseResult(result);
    } catch (err) {
      this.logger.warn(`Azure assessment failed: ${String(err)}`);
      throw new ServiceUnavailableException('Speech assessment failed');
    } finally {
      recognizer.close();
    }
  }

  /**
   * Azure returns its rich detail JSON under a properties bag keyed by a
   * GUID-ish constant. We re-shape it into the SpeechAssessment defined in
   * @repo/types so the web layer doesn't need to know about the SDK.
   */
  private parseResult(result: sdk.SpeechRecognitionResult): SpeechAssessment {
    const json = result.properties.getProperty(
      sdk.PropertyId.SpeechServiceResponse_JsonResult,
    );
    if (!json) {
      return {
        accuracyScore: 0,
        fluencyScore: 0,
        completenessScore: 0,
        pronunciationScore: 0,
        words: [],
      };
    }
    type Raw = {
      NBest?: Array<{
        PronunciationAssessment?: {
          AccuracyScore: number;
          FluencyScore: number;
          CompletenessScore: number;
          PronScore: number;
        };
        Words?: Array<{
          Word: string;
          PronunciationAssessment?: { AccuracyScore: number; ErrorType: string };
        }>;
      }>;
    };
    const parsed = JSON.parse(json) as Raw;
    const best = parsed.NBest?.[0];
    const pa = best?.PronunciationAssessment;
    const words: WordScore[] = (best?.Words ?? []).map((w) => ({
      word: w.Word,
      accuracyScore: w.PronunciationAssessment?.AccuracyScore ?? 0,
      errorType: (w.PronunciationAssessment?.ErrorType ?? 'None') as WordScore['errorType'],
    }));
    return {
      accuracyScore: pa?.AccuracyScore ?? 0,
      fluencyScore: pa?.FluencyScore ?? 0,
      completenessScore: pa?.CompletenessScore ?? 0,
      pronunciationScore: pa?.PronScore ?? 0,
      words,
    };
  }
}
