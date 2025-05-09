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

  async sendMessage(toPhoneNumber: string, content: string) {
    const payload = {
      messaging_product: 'whatsapp',
      to: toPhoneNumber,
      type: 'text',
      text: { body: content },
    };

    return await this.httpService.axiosRef.post(this.apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
}
