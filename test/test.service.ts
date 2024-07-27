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
    await this.deleteDislikeComment();
    await this.deleteLikeComment();
    await this.deleteComment();
    await this.deleteDislikeThread();
    await this.deleteLikeThread();
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

  async getThread(id: string) {
    return this.prismaService.thread.findFirst({
      where: {
        id,
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
    const thread = await this.prismaService.thread.create({
      data: {
        user_id: user.id,
        body: 'test',
      },
    });
    const detailThread = await this.getThread(thread.id);
    return detailThread;
  }

  async deleteThread() {
    const thread = await this.prismaService.thread.deleteMany({
      where: {
        body: 'test',
      },
    });
    return thread;
  }

  async deleteLikeThread() {
    return this.prismaService.thread_Like.deleteMany();
  }

  async deleteDislikeThread() {
    return this.prismaService.thread_Dislike.deleteMany();
  }

  async deleteComment() {
    return this.prismaService.comment.deleteMany();
  }
  async deleteLikeComment() {
    return this.prismaService.comment_Like.deleteMany();
  }

  async deleteDislikeComment() {
    return this.prismaService.comment_Dislike.deleteMany();
  }

  async deleteImage(fileName) {
    await this.uploadImageService.deleteFile(fileName);
  }
}
