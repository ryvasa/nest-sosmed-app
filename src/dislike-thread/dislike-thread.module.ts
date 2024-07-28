import { Module } from '@nestjs/common';
import { DislikeThreadService } from './dislike-thread.service';
import { DislikeThreadController } from './dislike-thread.controller';
import { ThreadsModule } from '../threads/threads.module';

@Module({
  imports: [ThreadsModule],
  controllers: [DislikeThreadController],
  providers: [DislikeThreadService],
})
export class DislikeThreadModule {}
