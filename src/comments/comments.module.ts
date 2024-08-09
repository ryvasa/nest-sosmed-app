import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ThreadsModule } from '../threads/threads.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [ThreadsModule, NotificationsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
