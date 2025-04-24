import {
  Controller,
  Get,
  Post,
  Query,
  Render,
  UploadedFile,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';

@ApiTags('chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @ApiExcludeEndpoint()
  @Get()
  @Render('chats')
  async getChatPage() {
    const gottenChats = await this.chatsService.getChats();
    return {
      chats: gottenChats.map((c) => ({
        query: c.query,
        reply: c.reply,
        time: c.createdAt,
      })),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Process a message with optional file input',
    description: 'Processes a user message, optionally with a file upload.',
  })
  @ApiQuery({
    name: 'query',
    type: String,
    required: true,
    description: 'The query or message to process',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional file to upload',
        },
      },
    },
  })
  async createChat(
    @Query('query') query?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.chatsService.createChat({ query, file });
  }
}
