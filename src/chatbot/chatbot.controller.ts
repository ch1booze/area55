import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const VERIFY_TOKEN = 'token';
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(400);
    }
  }

  @Post('webhook')
  @HttpCode(200)
  async handleIncomingMessageWebhook(@Body() body: any) {
    console.log('Incoming webhook:', JSON.stringify(body));
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const phoneNumber = message?.from;
    console.log('Message:', message);
    console.log('Phone number:', phoneNumber);
    if (phoneNumber && message?.type === 'text') {
      await this.chatbotService.sendMessage(phoneNumber);
    }
  }
}
