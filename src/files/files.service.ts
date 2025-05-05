import { Inject, Injectable } from '@nestjs/common';
import { FileEntity } from './files.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FilesService {
  constructor(
    @Inject('FILE_REPOSITORY') private fileRepository: Repository<FileEntity>,
  ) {}

  async uploadFile(file: Express.Multer.File) {
    const fileEntity = this.fileRepository.create({
      name: file.originalname,
      size: file.size,
      buffer: file.buffer,
      mimetype: file.mimetype,
    });
    await this.fileRepository.save(fileEntity);
    return fileEntity;
  }
}
