import { Module } from '@nestjs/common';
import { CommentsModule } from '../comments/comments.module';
import { LikeCommentController } from './like-comment.controller';
import { LikeCommentService } from './like-comment.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [CommentsModule, NotificationsModule],
  controllers: [LikeCommentController],
  providers: [LikeCommentService],
})
export class LikeCommentModule {}
