import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CronEntity } from './cron.entity';
import { Repository, LessThanOrEqual } from 'typeorm';
import { CreateCronDto } from './cron.interfaces';
import { Cron } from '@nestjs/schedule';
import { ChatbotService } from 'src/chatbot/chatbot.service';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(CronEntity)
    private readonly cronRepository: Repository<CronEntity>,
    private readonly chatbotService: ChatbotService,
  ) {}

  async createCron(dto: CreateCronDto) {
    const cronEntity = new CronEntity();
    cronEntity.time = dto.time;
    cronEntity.message = dto.message;
    cronEntity.toPhoneNumber = dto.toPhoneNumber;

    await this.cronRepository.save(cronEntity);
  }

  @Cron('0 * * * * *')
  async processCron() {
    try {
      const now = new Date();
      const cronEntities = await this.cronRepository.find({
        where: {
          time: LessThanOrEqual(now),
          completed: false,
        },
      });

      for (const cronEntity of cronEntities) {
        await this.chatbotService.sendMessage({
          messaging_product: 'whatsapp',
          to: cronEntity.toPhoneNumber,
          type: 'text',
          text: { body: cronEntity.message },
        });

        cronEntity.completed = true;
        await this.cronRepository.save(cronEntity);
      }
    } catch (error) {
      console.error('Error processing cron jobs:', error);
    }
  }
}
