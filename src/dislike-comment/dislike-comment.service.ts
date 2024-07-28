import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CommentsService } from '../comments/comments.service';

interface DislikeCommentParams {
  userId: string;
  commentId: string;
  threadId: string;
}
@Injectable()
export class DislikeCommentService {
  constructor(
    private prismaService: PrismaService,
    private commentService: CommentsService,
  ) {}

  async checkDislikeComment({
    commentId,
    threadId,
    userId,
  }: DislikeCommentParams) {
    await this.commentService.findOne(commentId, threadId);
    const dislikedComment = await this.prismaService.comment_Dislike.findFirst({
      where: {
        user_id: userId,
        comment_id: commentId,
      },
    });
    return dislikedComment;
  }
  async create({ userId, commentId, threadId }: DislikeCommentParams) {
    const dislike = await this.checkDislikeComment({
      userId,
      commentId,
      threadId,
    });
    if (dislike) {
      return { message: 'Already disliked' };
    }
    return this.prismaService.comment_Dislike.create({
      data: {
        user_id: userId,
        comment_id: commentId,
        dislike: true,
      },
    });
  }

  async remove({ userId, commentId, threadId }: DislikeCommentParams) {
    const dislike = await this.checkDislikeComment({
      userId,
      commentId,
      threadId,
    });
    if (!dislike) {
      throw new NotFoundException('Dislike not found');
    }
    await this.prismaService.comment_Dislike.delete({
      where: {
        id: dislike.id,
      },
    });
    return { message: 'Dislike removed' };
  }
}
