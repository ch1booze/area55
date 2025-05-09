import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatsService } from 'src/chats/chats.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatbotService {
  private readonly apiUrl: string;
  private readonly apiToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly chatsService: ChatsService,
    private readonly usersService: UsersService,
  ) {
    this.apiUrl = this.configService.get<string>('GRAPH_API_URL')!;
    this.apiToken = this.configService.get<string>('GRAPH_API_TOKEN')!;
  }

  async handleIncomingMessage(body: any) {
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) {
      throw new Error('Message not found in the payload');
    }

    const name = body?.entry?.[0]?.changes?.[0]?.contacts?.[0]?.profile
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
          payload = {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: { body: messageBody },
          };
        }
      } else if (messageType === 'image') {
        payload = {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: 'An image was sent. How can I help with it?' },
        };
      } else if (messageType === 'audio') {
        payload = {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: 'An audio was sent. Would you like me to transcribe it?',
          },
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

  private async sendMessage(payload: any) {
    return await this.httpService.axiosRef.post(this.apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
}
