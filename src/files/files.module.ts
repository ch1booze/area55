import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { DatabaseModule } from 'src/database/database.module';
import { filesProviders } from './files.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...filesProviders, FilesService],
  exports: [FilesService],
})
export class FilesModule {}
