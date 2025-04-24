import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ReadImageEvent,
  ScheduleMessageEvent,
  SetReminderEvent,
  TranscribeAudioEvent,
} from './chats.interfaces';
import { Groq } from '@llamaindex/groq';
import { StartEvent, StopEvent, Workflow } from 'llamaindex';
import { Repository } from 'typeorm';
import { Chat } from './chats.entity';

@Injectable()
export class ChatsService {
  constructor(
    @Inject('CHAT_REPOSITORY') private chatRepository: Repository<Chat>,
    private readonly configService: ConfigService,
  ) {}

  async createChat(createChatDto: {
    query?: string;
    file?: Express.Multer.File;
  }) {
    const llm = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
      model: 'llama-3.1-8b-instant',
    });

    const detectIntent = async (
      _: unknown,
      ev: StartEvent<{ query?: string; file?: Express.Multer.File }>,
    ) => {
      const prompt = `
        Given the input: "${ev.data.query ?? ''}", determine the user's intent.
        Respond with only one of the following options: schedule a message, transcribe audio, read image contents, and set a reminder.
        Respond with only the option text, and nothing else.
        `;
      const response = await llm.complete({ prompt });
      const rawIntent = response.text.trim().toLowerCase();
      let intent: string | null = null;
      if (rawIntent.includes('schedule')) {
        intent = 'schedule a message';
      } else if (rawIntent.includes('transcribe')) {
        intent = 'transcribe audio';
      } else if (rawIntent.includes('image')) {
        intent = 'read image contents';
      } else if (rawIntent.includes('reminder')) {
        intent = 'set a reminder';
      }

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
          return new StopEvent<string>('Invalid intent.');
      }
    };

    const handleScheduleMessage = async (
      _: unknown,
      ev: ScheduleMessageEvent,
    ) => {
      return new StopEvent<string>(JSON.stringify(ev.data));
    };

    const handleTranscribeAudio = async (
      _: unknown,
      ev: TranscribeAudioEvent,
    ) => {
      return new StopEvent<string>(JSON.stringify(ev.data));
    };

    const handleReadImage = async (_: unknown, ev: ReadImageEvent) => {
      return new StopEvent<string>(JSON.stringify(ev.data));
    };

    const handleSetReminder = async (_: unknown, ev: SetReminderEvent) => {
      return new StopEvent<string>(JSON.stringify(ev.data));
    };

    const workflow = new Workflow<
      unknown,
      { query?: string; file?: Express.Multer.File },
      string
    >();

    workflow.addStep(
      {
        inputs: [StartEvent<{ query?: string; file?: Express.Multer.File }>],
        outputs: [
          ScheduleMessageEvent,
          TranscribeAudioEvent,
          ReadImageEvent,
          SetReminderEvent,
          StopEvent<string>,
        ],
      },
      detectIntent,
    );

    workflow.addStep(
      {
        inputs: [ScheduleMessageEvent],
        outputs: [StopEvent<string>],
      },
      handleScheduleMessage,
    );

    workflow.addStep(
      {
        inputs: [TranscribeAudioEvent],
        outputs: [StopEvent<string>],
      },
      handleTranscribeAudio,
    );

    workflow.addStep(
      {
        inputs: [ReadImageEvent],
        outputs: [StopEvent<string>],
      },
      handleReadImage,
    );

    workflow.addStep(
      {
        inputs: [SetReminderEvent],
        outputs: [StopEvent<string>],
      },
      handleSetReminder,
    );

    const response = await workflow.run(createChatDto);
    const reply = response.data;

    const chat = this.chatRepository.create({
      query: createChatDto.query,
      reply,
      file: createChatDto.file?.buffer,
    });
    return await this.chatRepository.save(chat);
  }

  async getChats() {
    return await this.chatRepository.find();
  }
}
