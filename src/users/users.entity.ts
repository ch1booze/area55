import { ChatEntity } from 'src/chats/chats.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column()
  phoneNumber: string;

  @OneToMany(() => ChatEntity, (chat) => chat.user)
  chats: ChatEntity[];
}
