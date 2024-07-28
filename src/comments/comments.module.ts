import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ThreadsModule } from '../threads/threads.module';

@Module({
  imports: [ThreadsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
