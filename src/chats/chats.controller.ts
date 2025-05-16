import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from 'src/files/files.interfaces';
import { FilePipe } from 'src/files/files.pipes';
import { AuthGuard } from 'src/users/auth.guard';
import { Request } from 'express';

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createChat(
    @Req() req: Request,
    @Query('query') query: string = '',
    @UploadedFile(new FilePipe()) file?: UploadFileDto,
  ) {
    const userId = req.session.userId!;
    return await this.chatsService.createChat(userId, false, query, file);
  }

  @Get()
  async getChats(@Req() req: Request) {
    const userId = req.session.userId!;
    return await this.chatsService.getChats(userId);
  }
}
