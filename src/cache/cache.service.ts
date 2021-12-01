import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async getCacheData(key: string): Promise<any> {
    return await this.cache.get(key);
  }
  async setCacheData(key: string, value: any): Promise<void> {
    await this.cache.set(key, value);
  }
}
