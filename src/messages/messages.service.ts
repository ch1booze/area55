import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ReadImageEvent,
  ScheduleMessageEvent,
  SetReminderEvent,
  TranscribeAudioEvent,
} from './messages.dto';
import { Groq } from '@llamaindex/groq';
import { StartEvent, StopEvent, Workflow } from 'llamaindex';

@Injectable()
export class MessagesService {
  constructor(private readonly configService: ConfigService) {}

  async processMessage(processMessageDto: {
    query?: string;
    file?: Express.Multer.File;
  }) {
    const llm = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
      model: 'llama-3.1-8b-instant',
    });

    const detectIntentTool = async ({}) => {};

    const detectIntent = async (
      _: unknown,
      ev: StartEvent<{ query?: string; file?: Express.Multer.File }>,
    ) => {
      const prompt = `Given the input: "${ev.data.query ?? ''}", determine if the user wants to schedule a message, transcribe audio, read image contents, or set a reminder. Respond with only the intent.`;
      console.log(prompt);
      const response = await llm.complete({ prompt });
      const intent = response.text.trim().toLowerCase();
      console.log('Intent:', intent);
      switch (intent) {
        case 'schedule a message':
          return new ScheduleMessageEvent({
            contact: '+1234567890',
            message: 'Something',
            time: new Date().toISOString(),
          });
        case 'transcribe audio':
          return new TranscribeAudioEvent({
            transcript: 'Transcription complete',
          });
        case 'read image contents':
          return new ReadImageEvent({
            description: 'That looks like Mona Lisa',
          });
        case 'set a reminder':
          return new SetReminderEvent({
            task: 'Do pushups',
            time: new Date().toISOString(),
          });
        default:
          return new StopEvent<{ result: string }>({
            result: 'Invalid intent.',
          });
      }
    };

    const handleScheduleMessage = async (
      _: unknown,
      ev: ScheduleMessageEvent,
    ) => {
      return new StopEvent<{ result: string }>({
        result: JSON.stringify(ev.data),
      });
    };

    const handleTranscribeAudio = async (
      _: unknown,
      ev: TranscribeAudioEvent,
    ) => {
      return new StopEvent<{ result: string }>({
        result: JSON.stringify(ev.data),
      });
    };

    const handleReadImage = async (_: unknown, ev: ReadImageEvent) => {
      return new StopEvent<{ result: string }>({
        result: JSON.stringify(ev.data),
      });
    };

    const handleSetReminder = async (_: unknown, ev: SetReminderEvent) => {
      return new StopEvent<{ result: string }>({
        result: JSON.stringify(ev.data),
      });
    };

    const workflow = new Workflow<
      unknown,
      { query?: string; file?: Express.Multer.File },
      { result: string }
    >();

    workflow.addStep(
      {
        inputs: [StartEvent<{ query?: string; file?: Express.Multer.File }>],
        outputs: [
          ScheduleMessageEvent,
          TranscribeAudioEvent,
          ReadImageEvent,
          SetReminderEvent,
          StopEvent<{ result: string }>,
        ],
      },
      detectIntent,
    );

    workflow.addStep(
      {
        inputs: [ScheduleMessageEvent],
        outputs: [StopEvent<{ result: string }>],
      },
      handleScheduleMessage,
    );

    workflow.addStep(
      {
        inputs: [TranscribeAudioEvent],
        outputs: [StopEvent<{ result: string }>],
      },
      handleTranscribeAudio,
    );

    workflow.addStep(
      {
        inputs: [ReadImageEvent],
        outputs: [StopEvent<{ result: string }>],
      },
      handleReadImage,
    );

    workflow.addStep(
      {
        inputs: [SetReminderEvent],
        outputs: [StopEvent<{ result: string }>],
      },
      handleSetReminder,
    );

    const result = await workflow.run(processMessageDto);
    return result.data;
  }
}
