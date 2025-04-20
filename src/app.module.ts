import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { MessagingModule } from './messaging/messaging.module';
import { UsersModule } from './users/users.module';
import { RemindersModule } from './reminders/reminders.module';

@Module({
  imports: [AiModule, MessagingModule, UsersModule, RemindersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
