import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CommentsService } from '../comments/comments.service';

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
  ) {}

  async checkLikeComment({ commentId, threadId, userId }: LikeCommentParams) {
    await this.commentService.findOne(commentId, threadId);
    const likedComment = await this.prismaService.comment_Like.findFirst({
      where: {
        user_id: userId,
        comment_id: commentId,
      },
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
    return this.prismaService.comment_Like.create({
      data: {
        user_id: userId,
        comment_id: commentId,
        like: true,
      },
    });
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
    return { message: 'Like removed' };
  }
}
