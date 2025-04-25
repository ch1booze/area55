import { BaseOutputParser } from 'llamaindex';

export enum Intent {
  SCHEDULE_MESSAGE = 'schedule_message',
  TRANSCRIBE_AUDIO = 'transcribe_audio',
  READ_IMAGE = 'read_image',
  SET_REMINDER = 'set_reminder',
  UNKNOWN = 'unknown',
}

export interface DetectIntentResponse {
  intent: Intent.SCHEDULE_MESSAGE | Intent.SET_REMINDER | Intent.UNKNOWN;
}

export class JsonOutputParser implements BaseOutputParser {
  parse(output: string): DetectIntentResponse {
    try {
      const result = JSON.parse(output) as DetectIntentResponse;
      return result;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw error;
    }
  }
}
