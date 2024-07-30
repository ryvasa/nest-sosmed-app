import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
  imports: [UsersModule],
})
export class ChatsModule {}
