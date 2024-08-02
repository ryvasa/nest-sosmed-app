import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ThreadsModule } from './threads/threads.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ImagesModule } from './images/images.module';
import { DislikeThreadModule } from './dislike-thread/dislike-thread.module';
import { LikeThreadModule } from './like-thread/like-thread.module';
import { CommentsModule } from './comments/comments.module';
import { DislikeCommentModule } from './dislike-comment/dislike-comment.module';
import { LikeCommentModule } from './like-comment/like-comment.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/images',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    UsersModule,
    AuthModule,
    ThreadsModule,
    ImagesModule,
    DislikeThreadModule,
    LikeThreadModule,
    CommentsModule,
    DislikeCommentModule,
    LikeCommentModule,
    ChatsModule,
    MessagesModule,
    ChatsModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
