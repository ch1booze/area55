import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ChatsModule } from './chats/chats.module';
import { FilesModule } from './files/files.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    DatabaseModule,
    ChatsModule,
    FilesModule,
    ChatbotModule,
  ],
})
export class AppModule {}
