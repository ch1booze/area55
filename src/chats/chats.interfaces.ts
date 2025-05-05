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
    recipient: string,
    message: string,
    time: string,
  }
  The recipient is the person or entity that the message is intended for.
  The message is the content of the message.
  The time is the time at which the message should be sent. It should be in the format of "YYYY-MM-DD HH:MM:SS".

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
  The time is the time at which the reminder should be set. It should be in the format of "YYYY-MM-DD HH:MM:SS".

  If any of this information is missing, reply in that field as "MISSING".
  `,
  [Intent.READ_IMAGE]: `Describe the image."`,
  [Intent.TRANSCRIBE_AUDIO]: `Transcribe and summarize the audio."`,
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
  'audio/wav',
  'audio/mpeg',
  'audio/ogg',
  'audio/webm',
  'audio/mp3',
  'audio/m4a',
];
