import { Module } from '@nestjs/common';
import { ThreadsModule } from '../threads/threads.module';
import { LikeThreadController } from './like-thread.controller';
import { LikeThreadService } from './like-thread.service';

@Module({
  imports: [ThreadsModule],
  controllers: [LikeThreadController],
  providers: [LikeThreadService],
})
export class LikeThreadModule {}
