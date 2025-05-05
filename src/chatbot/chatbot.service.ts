import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatbotService {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('WAB_API_URL')!;
  }

  async sendMessage(toPhoneNumber: string, content: string) {
    const payload = {
      messaging_product: 'whatsapp',
      to: toPhoneNumber,
      type: 'text',
      text: { body: content },
    };

    await firstValueFrom(
      this.httpService.post(this.apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('WAB_API_ACCESS_TOKEN')}`,
          'Content-Type': 'application/json',
        },
      }),
    );
  }
}
