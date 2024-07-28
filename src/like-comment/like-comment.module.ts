import { Module } from '@nestjs/common';
import { CommentsModule } from '../comments/comments.module';
import { LikeCommentController } from './like-comment.controller';
import { LikeCommentService } from './like-comment.service';

@Module({
  imports: [CommentsModule],
  controllers: [LikeCommentController],
  providers: [LikeCommentService],
})
export class LikeCommentModule {}
