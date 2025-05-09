import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ChatbotModule } from 'src/chatbot/chatbot.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronEntity } from './cron.entity';

@Module({
  imports: [ChatbotModule, TypeOrmModule.forFeature([CronEntity])],
  providers: [CronService],
})
export class CronModule {}
