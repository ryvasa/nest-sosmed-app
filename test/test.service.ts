import { PrismaService } from '../src/common/prisma.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { RegisterAuthDto } from '../src/auth/dto/register-auth.dto';
import { UploadImageService } from '../src/common/upload-image.service';

@Injectable()
export class TestService {
  constructor(
    private prismaService: PrismaService,
    private uploadImageService: UploadImageService,
  ) {}

  async deleteAll() {
    await this.deleteThread();
    await this.deleteUser();
  }

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        email: 'test@gmail.com',
      },
    });
  }

  async getUser(): Promise<User> {
    return this.prismaService.user.findUnique({
      where: {
        email: 'test@gmail.com',
      },
    });
  }

  async createUser() {
    const user = new RegisterAuthDto();
    user.username = 'test';
    user.email = 'test@gmail.com';
    user.password = await bcrypt.hash('test', 10);
    await this.prismaService.user.create({
      data: user,
    });
  }

  async getThread() {
    return this.prismaService.thread.findFirst({
      where: {
        body: 'test',
      },
      include: {
        user: { select: { username: true, avatar: true } },
        images: { select: { image: true } },
        _count: {
          select: {
            thread_likes: true,
            thread_dislikes: true,
            comments: true,
          },
        },
      },
    });
  }
  async createThread() {
    const user = await this.getUser();
    await this.prismaService.thread.create({
      data: {
        user_id: user.id,
        body: 'test',
      },
    });
    const detailThread = await this.getThread();
    return detailThread;
  }

  async getComment() {
    return this.prismaService.comment.findFirst({
      where: {
        body: 'test',
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: {
          select: {
            comment_likes: true,
            comment_dislikes: true,
          },
        },
      },
    });
  }
  async createComment() {
    const user = await this.getUser();
    const thread = await this.getThread();
    const comment = await this.prismaService.comment.create({
      data: {
        user_id: user.id,
        thread_id: thread.id,
        body: 'test',
      },
    });

    return comment;
  }
  async createDislikeComment(comentId: string, userId: string) {
    const dislikeComment = await this.prismaService.comment_Dislike.create({
      data: {
        user_id: userId,
        comment_id: comentId,
        dislike: true,
      },
    });
    return dislikeComment;
  }

  async createLikeComment(comentId: string, userId: string) {
    const dislikeComment = await this.prismaService.comment_Like.create({
      data: {
        user_id: userId,
        comment_id: comentId,
        like: true,
      },
    });
    return dislikeComment;
  }

  async createDislikeThread(threaId: string, userId: string) {
    return this.prismaService.thread_Dislike.create({
      data: {
        user_id: userId,
        thread_id: threaId,
        dislike: true,
      },
    });
  }

  async createLikeThread(threaId: string, userId: string) {
    return this.prismaService.thread_Like.create({
      data: {
        user_id: userId,
        thread_id: threaId,
        like: true,
      },
    });
  }

  async deleteThread() {
    const thread = await this.prismaService.thread.deleteMany({
      where: {
        body: 'test',
      },
    });
    return thread;
  }

  async deleteImage(fileName: string) {
    await this.uploadImageService.deleteFile(fileName);
  }
}
