import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ThreadsService } from '../threads/threads.service';
import { PrismaService } from '../common/prisma.service';

interface UpdateParams {
  threadId: string;
  commentId: string;
  updateCommentDto: UpdateCommentDto;
  userId: string;
}

const commentSelect = {
  id: true,
  body: true,
  user: { select: { id: true, username: true, avatar: true, active: true } },
  created_at: true,
  comment_likes: {
    select: {
      user: { select: { id: true } },
    },
  },
  comment_dislikes: {
    select: {
      user: { select: { id: true } },
    },
  },
  _count: {
    select: {
      comment_dislikes: true,
      comment_likes: true,
    },
  },
};

@Injectable()
export class CommentsService {
  constructor(
    private threadService: ThreadsService,
    private prismaService: PrismaService,
  ) {}

  async validateAuthor(
    commentId: string,
    userId: string,
    threadId: string,
  ): Promise<any> {
    const comment = await this.findOne(commentId, threadId);
    if (comment.user.id !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to edit or delete this comment',
      );
    }
    return comment;
  }
  async create(
    threadId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<any> {
    await this.threadService.findOne(threadId);
    const comment = await this.prismaService.comment.create({
      data: {
        body: createCommentDto.body,
        user_id: userId,
        thread_id: threadId,
      },
      select: commentSelect,
    });
    return comment;
  }

  async findAllCommentsThread(
    threadId: string,
    take: number,
    skip: number,
  ): Promise<any> {
    await this.threadService.findOne(threadId);
    const comments = await this.prismaService.comment.findMany({
      where: {
        thread_id: threadId,
      },
      take,
      skip,
      orderBy: { created_at: 'desc' },
      select: commentSelect,
    });
    return comments;
  }
  async countCommentThread(threadId: string): Promise<number> {
    await this.threadService.findOne(threadId);
    return this.prismaService.comment.count({
      where: {
        thread_id: threadId,
      },
    });
  }
  async findOne(commentId: string, threadId: string): Promise<any> {
    await this.threadService.findOne(threadId);
    const comment = await this.prismaService.comment.findFirst({
      where: {
        id: commentId,
      },
      select: commentSelect,
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async update({
    commentId,
    threadId,
    updateCommentDto,
    userId,
  }: UpdateParams): Promise<any> {
    await this.findOne(commentId, threadId);
    await this.validateAuthor(commentId, userId, threadId);

    const comment = await this.prismaService.comment.update({
      where: {
        id: commentId,
      },
      data: {
        body: updateCommentDto.body,
      },
      select: {
        id: true,
        body: true,
        user: true,
        created_at: true,
        _count: {
          select: {
            comment_dislikes: true,
            comment_likes: true,
          },
        },
      },
    });
    return comment;
  }

  async remove(commentId: string, userId: string, threadId: string) {
    await this.validateAuthor(commentId, userId, threadId);
    await this.prismaService.comment.delete({
      where: {
        id: commentId,
      },
    });
    return 'Comment deleted';
  }
}
