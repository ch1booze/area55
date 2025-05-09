import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ChatbotModule } from 'src/chatbot/chatbot.module';

@Module({
  imports: [ChatbotModule],
  providers: [CronService],
})
export class CronModule {}
