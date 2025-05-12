import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatsService } from 'src/chats/chats.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatbotService {
  private readonly apiBaseUrl: string;
  private readonly apiUrl: string;
  private readonly apiToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly chatsService: ChatsService,
    private readonly usersService: UsersService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('GRAPH_API_BASE_URL')!;
    this.apiUrl = this.configService.get<string>('GRAPH_API_URL')!;
    this.apiToken = this.configService.get<string>('GRAPH_API_TOKEN')!;
  }

  async handleIncomingMessage(body: any) {
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    const name = body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile
      ?.name as string;
    const phoneNumber = message.from as string;
    const messageType = message.type as string;

    let payload: any;

    try {
      if (messageType === 'text') {
        const messageBody = message.text?.body as string;
        if (!messageBody) {
          throw new Error('Message body not found');
        }

        if (
          messageBody.toLowerCase().replace(',', '').trim() === 'hey area55'
        ) {
          payload = {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: {
              body: `Hey, ${name}

            👽 Welcome to Area55! Your ultimate assistant is here!

            I’m thrilled to help you with a variety of tasks. Here’s what I can do:

            🎤 *Transcribe audio files*: Send me any audio, and I’ll convert it to text for you.

            🗓️ *Set reminders*: Just say or send, "Remind me to [task] at [time]."

            📍 *Find the best recommendations*: Need suggestions for products, places, or services? I’ve got you covered!

            📑 *Summarise news articles*: Share a link, and I’ll give you a quick summary.

            And that’s just the beginning! Feel free to ask me anything. Let’s make things happen! 🚀`,
            },
          };
        } else {
          const chatEntity = await this.chatsService.createChat(
            messageBody,
            undefined,
          );
          payload = {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: { body: chatEntity.reply },
          };
        }
      } else if (messageType === 'image') {
        const mediaId = message.image.id as string;
        const mimetype = message.image.mime_type as string;
        const mediaUrl = await this.getMediaUrl(mediaId);
        const buffer = (await this.downloadMedia(mediaUrl, mimetype)) as Buffer;
        const chatEntity = await this.chatsService.createChat(undefined, {
          buffer,
          mimetype,
          name: mediaId,
          size: buffer.byteLength,
        });

        payload = {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: chatEntity.reply,
          },
        };
      } else if (messageType === 'audio') {
        const mediaId = message.audio.id as string;
        const mimetype = message.audio.mime_type as string;
        const mediaUrl = await this.getMediaUrl(mediaId);
        const buffer = (await this.downloadMedia(mediaUrl, mimetype)) as Buffer;
        const chatEntity = await this.chatsService.createChat(undefined, {
          buffer,
          mimetype,
          name: mediaId,
          size: buffer.byteLength,
        });

        payload = {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: chatEntity.reply },
        };
      } else {
        payload = {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: `I received a ${messageType} message. How can I assist you with this?`,
          },
        };
      }

      if (!payload) {
        throw new Error('Payload not defined');
      }

      return await this.sendMessage(payload);
    } catch (error) {
      console.error('Error handling incoming message:', error);
      const errorPayload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: 'Sorry, I encountered an error processing your message. Please try again later.',
        },
      };
      return await this.sendMessage(errorPayload);
    }
  }

  private async getMediaUrl(mediaId: string): Promise<string> {
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.apiBaseUrl}/${mediaId}`,
        { headers: { Authorization: `Bearer ${this.apiToken}` } },
      );
      return response.data.url;
    } catch (error) {
      console.error('Error getting media URL:', error);
      throw new Error('Failed to get media URL');
    }
  }

  private async downloadMedia(mediaUrl: string, mimetype: string) {
    try {
      const response = await this.httpService.axiosRef.get(mediaUrl, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading image:', error);
      throw new Error('Failed to download image');
    }
  }

  async sendMessage(payload: any) {
    return await this.httpService.axiosRef.post(this.apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
}
