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

    const phoneNumber = message!.from as string;
    const messageType = message!.type as string;

    if (messageType === 'text') {
      const messageBody = message!.text!.body as string;
      if (messageBody === 'Hey, Area55') {
        const payload = {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: { name: 'welcome_message', language: { code: 'en_US' } },
        };

        return await this.sendMessage(payload);
      } else {
        const payload = {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: messageBody },
        };

        return await this.sendMessage(payload);
      }
    }
  }

  private async sendMessage(payload: object) {
    return await this.httpService.axiosRef.post(this.apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
}
