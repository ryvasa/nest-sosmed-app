import { Module } from '@nestjs/common';
import { VideoCallService } from './video-call.service';
import { VideoCallGateway } from './video-call.gateway';
import { UsersModule } from '../users/users.module';
import { VideoCallController } from './video-call.controller';
import { MemoryCacheModule } from '../cache/cache.module';

@Module({
  controllers: [VideoCallController],
  imports: [UsersModule, MemoryCacheModule],
  providers: [VideoCallGateway, VideoCallService],
})
export class VideoCallModule {}
