import { forwardRef, Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { HttpModule } from '@nestjs/axios';
import { ChatsModule } from 'src/chats/chats.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [HttpModule, forwardRef(() => ChatsModule), UsersModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
