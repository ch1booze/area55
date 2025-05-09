import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatbotService {
  private readonly apiUrl: string;
  private readonly apiToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('GRAPH_API_URL')!;
    this.apiToken = this.configService.get<string>('GRAPH_API_TOKEN')!;
  }

  async handleIncomingMessage(body: any) {
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) {
      throw new Error('Message not found in the payload');
    }

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
            type: 'template',
            template: {
              name: 'hello_world',
              language: { code: 'en_US' },
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
