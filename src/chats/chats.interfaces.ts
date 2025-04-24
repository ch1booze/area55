import { WorkflowEvent } from 'llamaindex';

export class IntentEvent extends WorkflowEvent<{
  intent: string;
  data: string;
}> {}

export class ScheduleMessageEvent extends WorkflowEvent<{
  contact: string;
  time: string;
  message: string;
}> {}

export class TranscribeAudioEvent extends WorkflowEvent<{
  transcript: string;
}> {}

export class ReadImageEvent extends WorkflowEvent<{ description: string }> {}

export class SetReminderEvent extends WorkflowEvent<{
  time: string;
  task: string;
}> {}
