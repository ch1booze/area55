import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatsModule } from './chats/chats.module';
import { FilesModule } from './files/files.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users/users.entity';
import { FileEntity } from './files/files.entity';
import { ChatEntity, CronEntity } from './chats/chats.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    ChatsModule,
    FilesModule,
    ChatbotModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [UserEntity, FileEntity, ChatEntity, CronEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
