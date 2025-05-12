import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { UploadFileDto } from './files.interfaces';

@Injectable()
export class FilePipe implements PipeTransform {
  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file) return null;

    return {
      name: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    } as UploadFileDto;
  }
}
