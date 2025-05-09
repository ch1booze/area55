import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
