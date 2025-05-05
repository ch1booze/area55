import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Intent } from './chats.interfaces';

@Entity()
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  query: string;

  @Column({ type: 'enum', enum: Intent, default: Intent.UNKNOWN })
  intent: Intent;

  @Column()
  reply: string;

  @Column({ type: 'text', nullable: true })
  fileId?: string;
}

