import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CommentsService } from '../comments/comments.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ActionType } from '@prisma/client';

interface LikeCommentParams {
  userId: string;
  commentId: string;
  threadId: string;
}
@Injectable()
export class LikeCommentService {
  constructor(
    private prismaService: PrismaService,
    private commentService: CommentsService,
    private notificationService: NotificationsService,
  ) {}

  async checkLikeComment({ commentId, threadId, userId }: LikeCommentParams) {
    await this.commentService.findOne(commentId, threadId);
    const likedComment = await this.prismaService.comment_Like.findFirst({
      where: {
        user_id: userId,
        comment_id: commentId,
      },
      include: { comment: true },
    });
    return likedComment;
  }
  async create({ userId, commentId, threadId }: LikeCommentParams) {
    const like = await this.checkLikeComment({
      userId,
      commentId,
      threadId,
    });
    if (like) {
      return { message: 'Already liked' };
    }

    const result = await this.prismaService.comment_Like.create({
      data: {
        user_id: userId,
        comment_id: commentId,
        like: true,
      },
      include: { comment: true },
    });

    const data = {
      receiver_id: result.comment.user_id,
      sender_id: userId,
      action: 'LIKE' as ActionType,
      thread_id: result.comment.thread_id,
      comment_id: result.comment_id,
    };
    await this.notificationService.create(data);

    return result;
  }

  async remove({ userId, commentId, threadId }: LikeCommentParams) {
    const like = await this.checkLikeComment({
      userId,
      commentId,
      threadId,
    });
    if (!like) {
      throw new NotFoundException('Like not found');
    }
    await this.prismaService.comment_Like.delete({
      where: {
        id: like.id,
      },
    });
    const option = {
      receiver_id: like.comment.user_id,
      sender_id: userId,
      action: 'LIKE' as ActionType,
      thread_id: threadId,
      comment_id: commentId,
    };
    await this.notificationService.remove(option);

    return { message: 'Like removed' };
  }
}
