import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { MessagingModule } from './messaging/messaging.module';
import { UsersModule } from './users/users.module';
import { RemindersModule } from './reminders/reminders.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AiModule, MessagingModule, UsersModule, RemindersModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
