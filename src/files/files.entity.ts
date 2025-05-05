import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  name: string;

  @Column({ type: 'bytea' })
  buffer: Buffer;

  @Column({ type: 'int' })
  size: number;

  @Column()
  mimetype: string;
}
