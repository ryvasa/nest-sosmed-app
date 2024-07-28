import { Module } from '@nestjs/common';
import { CommentsModule } from '../comments/comments.module';
import { DislikeCommentController } from './dislike-comment.controller';
import { DislikeCommentService } from './dislike-comment.service';

@Module({
  imports: [CommentsModule],
  controllers: [DislikeCommentController],
  providers: [DislikeCommentService],
})
export class DislikeCommentModule {}
