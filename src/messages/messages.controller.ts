import { Controller, Post, Query, UploadedFile } from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

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
  async processMessage(
    @Query('query') query?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.messagesService.processMessage({ query, file });
  }
}
