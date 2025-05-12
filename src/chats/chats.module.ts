import { forwardRef, Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { FilesModule } from 'src/files/files.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity, CronEntity } from './chats.entity';
import { ChatbotModule } from 'src/chatbot/chatbot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatEntity, CronEntity]),
    FilesModule,
    forwardRef(() => ChatbotModule),
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
