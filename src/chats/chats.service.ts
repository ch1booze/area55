import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Chat } from './chats.entity';
import { Intent } from './chats.interfaces';

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
    let prompt: string;
    let intent: Intent;

    if (createChatDto.file) {
      switch (createChatDto.file.mimetype) {
        case 'image/jpeg':
        case 'image/png':
        case 'image/webp':
        case 'image/gif':
        case 'image/svg+xml':
        case 'image/bmp':
        case 'image/tiff':
          if (createChatDto.query) {
            prompt = `Read the image and answer the following question: ${createChatDto.query}`;
          } else {
            prompt = `Read the image and answer the following question: What is in the image?`;
          }
          intent = Intent.READ_IMAGE;
          break;
        case 'audio/wav':
        case 'audio/mpeg':
        case 'audio/ogg':
        case 'audio/webm':
        case 'audio/mp3':
        case 'audio/m4a':
          if (createChatDto.query) {
            prompt = `Transcribe the audio and answer the following question: ${createChatDto.query}`;
          } else {
            prompt = `Transcribe the audio and answer the following question: What is in the audio?`;
          }
          intent = Intent.TRANSCRIBE_AUDIO;
          break;
        default:
          throw new Error('Unsupported file type');
      }
    } else {
      if (!createChatDto.query) {
        throw new Error('Query is required');
      }
    }
  }

  async getChats() {
    return await this.chatRepository.find();
  }
}
