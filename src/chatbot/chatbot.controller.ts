import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleIncomingMessageWebhook(@Body() body: any) {
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const phoneNumber = message?.from;
    if (phoneNumber && message?.type === 'text') {
      await this.chatbotService.sendMessage(phoneNumber, 'Hi, I am Arial');
    }

    return 'EVENT_RECEIVED';
  }
}
