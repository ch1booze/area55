import { Injectable } from '@nestjs/common';
import { FileEntity } from './files.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadFileDto } from './files.interfaces';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
  ) {}

  async uploadFile(dto: UploadFileDto) {
    const fileEntity = new FileEntity();
    fileEntity.name = dto.name;
    fileEntity.size = dto.size;
    fileEntity.buffer = dto.buffer;
    fileEntity.mimetype = dto.mimetype;

    await this.fileRepository.save(fileEntity);
    return fileEntity;
  }
}
