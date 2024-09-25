import { Injectable } from '@nestjs/common';
import { VideoCallDto } from './video-call.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class VideoCallService {
  constructor(private readonly cacheService: CacheService) {}

  async addSocketId(body: VideoCallDto): Promise<any> {
    try {
      return await this.cacheService.set(body.key, body.value);
    } catch (error) {
      console.error('Error adding socket id to Redis:', error);
      return { success: false, error };
    }
  }

  async getId(userId: string): Promise<any> {
    return await this.cacheService.get(userId);
  }
}
