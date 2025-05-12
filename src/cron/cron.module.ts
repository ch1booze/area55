import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ChatbotModule } from 'src/chatbot/chatbot.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronEntity } from './cron.entity';
import { ChatsModule } from 'src/chats/chats.module';

@Module({
  imports: [ChatbotModule, ChatsModule, TypeOrmModule.forFeature([CronEntity])],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
