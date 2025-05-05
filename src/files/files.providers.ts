import { DataSource } from 'typeorm';
import { FileEntity } from './files.entity';

export const filesProviders = [
  {
    provide: 'FILE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(FileEntity),
    inject: ['DATA_SOURCE'],
  },
];
