import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { Thread } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

interface UpdateParams {
  files?: Express.Multer.File[];
  id: string;
  updateThreadDto: UpdateThreadDto;
  userId: string;
}

@Injectable()
export class ThreadsService {
  constructor(private prismaService: PrismaService) {}

  async create(
    files: Express.Multer.File[],
    userId: string,
    createThreadDto: CreateThreadDto,
  ): Promise<Thread> {
    const thread = await this.prismaService.thread.create({
      data: { user_id: userId, body: createThreadDto.body },
    });

    if (files.length > 0) {
      await this.prismaService.image.createMany({
        data: files.map((file) => {
          return {
            thread_id: thread.id,
            image: file.path,
          };
        }),
      });
    }

    const createdThread = await this.prismaService.thread.findFirst({
      where: { id: thread.id },
      include: {
        user: { select: { username: true, avatar: true } },
        images: { select: { image: true } },
      },
    });
    return createdThread;
  }

  async findAll({ body, take, skip }): Promise<Array<Thread>> {
    const thread = await this.prismaService.thread.findMany({
      where: {
        body: { contains: body },
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
      take: take ? take : 30,
      skip: skip ? skip : 0,
    });
    return thread;
  }

  async findOne(id: string): Promise<Thread> {
    const thread = await this.prismaService.thread.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, avatar: true } },
        images: { select: { image: true } },
        comments: {
          select: {
            id: true,
            body: true,
            created_at: true,
            updated_at: true,
            user: { select: { username: true, avatar: true } },
            _count: { select: { comment_dislikes: true, comment_likes: true } },
          },
        },
        _count: {
          select: {
            thread_likes: true,
            thread_dislikes: true,
            comments: true,
          },
        },
      },
    });
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
    return thread;
  }

  async validateAuthor(threadId: string, userId: string): Promise<Thread> {
    const thread = await this.findOne(threadId);
    if (thread.user_id !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to edit or delete this thread',
      );
    }
    return thread;
  }

  async update({
    files,
    id,
    updateThreadDto,
    userId,
  }: UpdateParams): Promise<Thread> {
    await this.validateAuthor(id, userId);

    const thread = await this.prismaService.thread.update({
      where: { id },
      data: {
        body: updateThreadDto.body,
      },
    });
    if (files.length > 0) {
      await this.prismaService.image.createMany({
        data: files.map((file) => {
          return {
            thread_id: thread.id,
            image: file.path,
          };
        }),
      });
    }
    const updatedThread = await this.findOne(thread.id);
    return updatedThread;
  }

  async remove(id: string, userId: string): Promise<any> {
    await this.validateAuthor(id, userId);
    await this.prismaService.thread.delete({ where: { id } });
    return { message: 'Thread deleted' };
  }
}
