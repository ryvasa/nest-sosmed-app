import { Module } from '@nestjs/common';
import { ThreadsModule } from '../threads/threads.module';
import { LikeThreadController } from './like-thread.controller';
import { LikeThreadService } from './like-thread.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ThreadsModule, NotificationsModule],
  controllers: [LikeThreadController],
  providers: [LikeThreadService],
})
export class LikeThreadModule {}
