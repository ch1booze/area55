import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ChatEntity } from './chats.entity';
import {
  AudioTypes,
  ClassifyIntentPrompt,
  ClassifyIntentResponse,
  ImageTypes,
  Intent,
  IntentPrompts,
} from './chats.interfaces';
import { Groq } from 'groq-sdk';
import { FilesService } from 'src/files/files.service';
import { FileEntity } from 'src/files/files.entity';
import { Groq as LlamaIndexGroq } from '@llamaindex/groq';
import * as fs from 'fs';
import * as tmp from 'tmp';
import * as path from 'path';

@Injectable()
export class ChatsService {
  private readonly groq: Groq;
  private readonly llamaindexGroq: LlamaIndexGroq;

  constructor(
    @Inject('CHAT_REPOSITORY') private chatRepository: Repository<ChatEntity>,
    private readonly configService: ConfigService,
    private readonly filesService: FilesService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });

    this.llamaindexGroq = new LlamaIndexGroq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
      model: 'llama3-8b-8192',
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
    file?: Express.Multer.File,
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

        const tmpFile = path.join(tmpDir, file!.originalname);
        await fs.promises.writeFile(tmpFile, file!.buffer);

        const response = await this.groq.audio.transcriptions.create({
          file: fs.createReadStream(tmpFile),
          model: 'whisper-large-v3-turbo',
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
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      });

      return response.choices[0].message.content;
    }

    const response = await this.llamaindexGroq.chat({
      messages: [
        { role: 'system', content: IntentPrompts[intent] },
        { role: 'user', content: query },
      ],
      responseFormat: { type: 'json_object' },
    });

    return response.message.content;
  }

  async createChat(query?: string, file?: Express.Multer.File) {
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
    chatEntity.reply = JSON.stringify(reply);
    chatEntity.fileId = fileEntity ? fileEntity.id : undefined;

    await this.chatRepository.save(chatEntity);
    return chatEntity;
  }

  async getChats() {
    return this.chatRepository.find();
  }
}
