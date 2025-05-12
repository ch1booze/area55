export enum Intent {
  SCHEDULE_MESSAGE = 'schedule_message',
  TRANSCRIBE_AUDIO = 'transcribe_audio',
  READ_IMAGE = 'read_image',
  SET_REMINDER = 'set_reminder',
  UNKNOWN = 'unknown',
}

export const ClassifyIntentPrompt = `
      You will be given a user's query.
      Determine the user's intent based on the following options:
      - schedule_message: when a user intends to send a message to someone else.
      - set_reminder: when a user intends to be reminded about something at a later time.
      If the intention does not match any of the above, return "unknown".

      Generate a JSON object with the following structure:
      {
        intent: "schedule_message" | "set_reminder" | "unknown";
      }
    `;

export interface ClassifyIntentResponse {
  intent: Intent.SCHEDULE_MESSAGE | Intent.SET_REMINDER | Intent.UNKNOWN;
}

export const IntentPrompts: { [key in Intent]: string } = {
  [Intent.SCHEDULE_MESSAGE]: `
  You are a helpful assistant that can schedule messages.
  You would be given a user query.
  You are to extract the following information in JSON in this format:
  {
    recipientName: string;
    recipientPhoneNumber: string;
    message: string;
    time: string;
  }

  The recipient is the person or entity that the message is intended for.
  The recipient is to have a name.
  The recipient's phone number should be valid WhatsApp number starting with '+' and then the country code.
  The message should be extracted from the user query.
  The message can a task to be completed, information to be shared, or a reminder.
  The time is the time at which the message should be sent. It should be in the ISO string format.
  The current time is ${new Date().toISOString()}.

  If any of this information is missing, reply in that field as "MISSING".
  `,
  [Intent.SET_REMINDER]: `
  You are a helpful assistant that can set reminders.
  You would be given a user query.
  You are to extract the following information in JSON in this format:
  {
    task: string,
    time: string,
  }
  The task is the thing that needs to be done.
  The time is the time at which the reminder should be set. It should be in the ISO string format.
  The current time is ${new Date().toISOString()}.

  If any of this information is missing, reply in that field as "MISSING".
  `,
  [Intent.READ_IMAGE]: `Describe the image.`,
  [Intent.TRANSCRIBE_AUDIO]: `Transcribe and summarize the audio.`,
  [Intent.UNKNOWN]: `You are an helpful assistant that can answer any question.`,
};

export const ImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
];

export const AudioTypes = [
  // PCM (uncompressed) audio
  'audio/wav', // .wav

  // MPEG audio
  'audio/mpeg', // .mp3 (preferred MIME type for MP3)
  'audio/mp3', // non-standard but often used
  'audio/mpeg; codecs=mp3', // explicit MP3 codec

  // Ogg container formats
  'audio/ogg', // general Ogg, codec unspecified
  'audio/ogg; codecs=vorbis', // Ogg Vorbis
  'audio/ogg; codecs=opus', // Ogg Opus
  'audio/ogg; codecs=flac', // Ogg FLAC
  'audio/ogg; codecs=speex', // Ogg Speex

  // WebM (uses Opus or Vorbis)
  'audio/webm', // WebM, codec unspecified
  'audio/webm; codecs=opus', // WebM with Opus
  'audio/webm; codecs=vorbis', // WebM with Vorbis

  // AAC / MPEG-4 audio
  'audio/mp4', // .m4a
  'audio/mp4; codecs="mp4a.40.2"', // AAC-LC in MP4 (common for m4a)
  'audio/x-m4a', // non-standard but used for iTunes m4a
  'audio/m4a', // often used interchangeably with above
];

export class ScheduleMessageResponse {
  recipientName: string;
  recipientPhoneNumber: string;
  message: string;
  time: string;
}

export class SetReminderResponse {
  task: string;
  time: string;
}

export class CreateCronDto {
  time: Date;
  toPhoneNumber: string;
  message: string;
}
