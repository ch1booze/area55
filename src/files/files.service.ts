import { Injectable } from '@nestjs/common';
import { FileEntity } from './files.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
  ) {}

  async uploadFile(file: Express.Multer.File) {
    const fileEntity = new FileEntity();
    fileEntity.name = file.originalname;
    fileEntity.size = file.size;
    fileEntity.buffer = file.buffer;
    fileEntity.mimetype = file.mimetype;

    await this.fileRepository.save(fileEntity);
    return fileEntity;
  }
}
