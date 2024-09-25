import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async get(key: any) {
    const data = await this.cache.get(key);
    return data;
  }

  async set(key: any, value: any) {
    try {
      const data = await this.cache.set(key, value, {
        ttl: 0,
      });
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
