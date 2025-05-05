import { DataSource } from 'typeorm';
import { ChatEntity } from './chats.entity';

export const chatsProviders = [
  {
    provide: 'CHAT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ChatEntity),
    inject: ['DATA_SOURCE'],
  },
];
