import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Intent } from './chats.interfaces';
import { UserEntity } from 'src/users/users.entity';

@Entity()
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'boolean' })
  isWhatsApp: boolean;

  @Column()
  query: string;

  @Column({ type: 'enum', enum: Intent, default: Intent.UNKNOWN })
  intent: Intent;

  @Column()
  reply: string;

  @ManyToOne(() => UserEntity, (user) => user.chats)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @Column({ type: 'text', nullable: true })
  fileId?: string;
}

@Entity()
export class CronEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  time: Date;

  @Column()
  message: string;

  @Column()
  toPhoneNumber: string;

  @Column({ default: false })
  completed: boolean;
}
