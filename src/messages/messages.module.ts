import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { ChatsModule } from '../chats/chats.module';
import { UsersModule } from '../users/users.module';
import { MessageController } from './message.controller';

@Module({
  imports: [ChatsModule, UsersModule],
  controllers: [MessageController],
  providers: [MessagesGateway, MessagesService],
})
export class MessagesModule {}
