import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { chatsProviders } from './chats.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ChatsController],
  providers: [...chatsProviders, ChatsService],
})
export class ChatsModule {}
