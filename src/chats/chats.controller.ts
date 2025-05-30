import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
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
  @Redirect()
  @UseInterceptors(FileInterceptor('file'))
  async createChat(
    @Req() req: Request,
    @Body('query') query: string = '',
    @UploadedFile(new FilePipe()) file?: UploadFileDto,
  ) {
    const userId = req.session.userId!;
    await this.chatsService.createChat(userId, false, query, file);
    return { url: '/chats' };
  }

  @Get()
  @Render('chats')
  async renderChats(@Req() req: Request) {
    const userId = req.session.userId!;
    const gottenChats = await this.chatsService.getChats(userId);
    return {
      chats: gottenChats.map((c) => ({
        query: c.query,
        reply: c.reply,
        time: c.createdAt,
      })),
    };
  }
}
