import { DataSource } from 'typeorm';
import { Chat } from './chats.entity';

export const chatsProviders = [
  {
    provide: 'CHAT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Chat),
    inject: ['DATA_SOURCE'],
  },
];
