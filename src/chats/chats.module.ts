import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { FilesModule } from 'src/files/files.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './chats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatEntity]), FilesModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
