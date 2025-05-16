import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LessThanOrEqual, Repository } from 'typeorm';
import { ChatEntity, CronEntity } from './chats.entity';
import {
  AudioTypes,
  ClassifyIntentPrompt,
  ClassifyIntentResponse,
  CreateCronDto,
  ImageTypes,
  Intent,
  IntentPrompts,
  ScheduleMessageResponse,
  SetReminderResponse,
} from './chats.interfaces';
import { Groq } from 'groq-sdk';
import { FilesService } from 'src/files/files.service';
import { FileEntity } from 'src/files/files.entity';
import { Groq as LlamaIndexGroq } from '@llamaindex/groq';
import * as fs from 'fs';
import * as tmp from 'tmp';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadFileDto } from 'src/files/files.interfaces';
import { Cron } from '@nestjs/schedule';
import { ChatbotService } from 'src/chatbot/chatbot.service';
import { UserEntity } from 'src/users/users.entity';

@Injectable()
export class ChatsService {
  private readonly groq: Groq;
  private readonly llamaindexGroq: LlamaIndexGroq;

  constructor(
    @InjectRepository(ChatEntity)
    private chatRepository: Repository<ChatEntity>,
    @InjectRepository(CronEntity)
    private readonly cronRepository: Repository<CronEntity>,
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
    @Inject(forwardRef(() => ChatbotService))
    private readonly chatbotService: ChatbotService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });

    this.llamaindexGroq = new LlamaIndexGroq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
      model: this.configService.get<string>('GROQ_LLAMAINDEX_MODEL')!,
    });
  }

  private async classifyIntent(query: string) {
    const response = await this.llamaindexGroq.chat({
      messages: [
        { role: 'system', content: ClassifyIntentPrompt },
        { role: 'user', content: query },
      ],
      responseFormat: { type: 'json_object' },
    });

    const responseJson = JSON.parse(
      response.message.content as string,
    ) as ClassifyIntentResponse;

    return responseJson.intent;
  }

  private async generateResponse(
    intent: Intent,
    query: string,
    file?: UploadFileDto,
  ) {
    if (intent === Intent.TRANSCRIBE_AUDIO) {
      const createTempDir = (): Promise<{
        path: string;
        cleanupCallback: () => void;
      }> => {
        return new Promise((resolve, reject) => {
          tmp.dir({ unsafeCleanup: true }, (err, path, cleanupCallback) => {
            if (err) {
              reject(err);
            } else {
              resolve({ path, cleanupCallback });
            }
          });
        });
      };

      let cleanupCallback: () => void;
      try {
        const { path: tmpDir, cleanupCallback: cb } = await createTempDir();
        cleanupCallback = cb;

        const tmpFile = path.join(tmpDir, file!.name);
        await fs.promises.writeFile(tmpFile, file!.buffer);

        const response = await this.groq.audio.transcriptions.create({
          file: fs.createReadStream(tmpFile),
          model: this.configService.get<string>('GROQ_AUDIO_MODEL')!,
        });

        return response.text;
      } catch (error) {
        console.error('Error during transcription:', error);
        throw error;
      } finally {
        if (cleanupCallback!) {
          cleanupCallback();
        }
      }
    } else if (intent === Intent.READ_IMAGE && file?.buffer) {
      const base64Image = file.buffer.toString('base64');
      const mimetype = file.mimetype;

      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: query },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimetype};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        model: this.configService.get<string>('GROQ_IMAGE_MODEL')!,
      });

      return response.choices[0].message.content;
    } else if (intent === Intent.SCHEDULE_MESSAGE) {
      const response = await this.llamaindexGroq.chat({
        messages: [
          { role: 'system', content: IntentPrompts[intent] },
          { role: 'user', content: query },
        ],
        responseFormat: { type: 'json_object' },
      });

      const { recipientName, recipientPhoneNumber, message, time } = JSON.parse(
        JSON.stringify(response.message.content),
      ) as ScheduleMessageResponse;
      if (!recipientName || recipientName === 'MISSING') {
        return `You didn't include the recipient's name`;
      } else if (!recipientPhoneNumber || recipientPhoneNumber === 'MISSING') {
        return `You didn't include the recipient's phone number`;
      } else if (!message || message === 'MISSING') {
        return `No message could be extracted from your query`;
      } else if (!time || time === 'MISSING') {
        return `You didn't give a time to send the message.`;
      }

      const datetime = new Date(time);
      await this.createCron({
        message,
        toPhoneNumber: recipientPhoneNumber,
        time: datetime,
      });

      return `I have scheduled a message for ${recipientPhoneNumber} at ${time}`;
    } else if (intent === Intent.SET_REMINDER) {
      const response = await this.llamaindexGroq.chat({
        messages: [
          { role: 'system', content: IntentPrompts[intent] },
          { role: 'user', content: query },
        ],
        responseFormat: { type: 'json_object' },
      });

      const { task, time } = JSON.parse(
        JSON.stringify(response.message.content),
      ) as SetReminderResponse;
      if (!task || task === 'MISSING') {
        return `No message could be extracted from your query`;
      } else if (!time || time === 'MISSING') {
        return `You didn't give a time to send the message.`;
      }

      const datetime = new Date(time);
      await this.createCron({
        message: task,
        toPhoneNumber: '+2348164998936',
        time: datetime,
      });

      return `I have set a reminder at ${time}`;
    } else if (intent === Intent.UNKNOWN) {
      const response = await this.llamaindexGroq.chat({
        messages: [
          { role: 'system', content: IntentPrompts[intent] },
          { role: 'user', content: query },
        ],
        responseFormat: { type: 'json_object' },
      });

      return JSON.stringify(response.message.content);
    }
  }

  async createChat(
    userId: string,
    isWhatsApp: boolean,
    query?: string,
    file?: UploadFileDto,
  ) {
    let intent: Intent;
    let fileEntity: FileEntity | null = null;

    if (file) {
      fileEntity = await this.filesService.uploadFile(file);
      if (ImageTypes.includes(fileEntity.mimetype)) {
        if (!query) {
          query = 'Describe the image';
        }
        intent = Intent.READ_IMAGE;
      } else if (AudioTypes.includes(fileEntity.mimetype)) {
        if (!query) {
          query = 'Transcribe the audio';
        }
        intent = Intent.TRANSCRIBE_AUDIO;
      } else {
        throw new BadRequestException('Unsupported file type');
      }
    } else {
      if (!query) {
        throw new BadRequestException(
          'Query is required when no file is provided',
        );
      }
      intent = await this.classifyIntent(query);
    }

    const reply = await this.generateResponse(intent, query, file);
    const chatEntity = new ChatEntity();
    chatEntity.query = query;
    chatEntity.intent = intent;
    chatEntity.reply = reply!;
    chatEntity.fileId = fileEntity ? fileEntity.id : undefined;
    chatEntity.userId = userId;
    chatEntity.isWhatsApp = isWhatsApp;

    await this.chatRepository.save(chatEntity);
    return chatEntity;
  }

  async getChats(userId: string) {
    return this.chatRepository.find({ where: { userId } });
  }

  private async createCron(dto: CreateCronDto) {
    const cronEntity = new CronEntity();
    cronEntity.time = dto.time;
    cronEntity.message = dto.message;
    cronEntity.toPhoneNumber = dto.toPhoneNumber;

    await this.cronRepository.save(cronEntity);
  }

  @Cron('0 * * * * *')
  private async processCron() {
    try {
      const now = new Date();
      const cronEntities = await this.cronRepository.find({
        where: {
          time: LessThanOrEqual(now),
          completed: false,
        },
      });

      for (const cronEntity of cronEntities) {
        await this.chatbotService.sendMessage({
          messaging_product: 'whatsapp',
          to: cronEntity.toPhoneNumber,
          type: 'text',
          text: { body: cronEntity.message },
        });

        cronEntity.completed = true;
        await this.cronRepository.save(cronEntity);
      }
    } catch (error) {
      console.error('Error processing cron jobs:', error);
    }
  }
}
