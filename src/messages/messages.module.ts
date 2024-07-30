import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { ChatsModule } from '../chats/chats.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ChatsModule, UsersModule],
  providers: [MessagesGateway, MessagesService],
})
export class MessagesModule {}
