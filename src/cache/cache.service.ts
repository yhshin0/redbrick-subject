import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  async get(key: string): Promise<any>{
    return await this.cache.get(key);
  }
  async set(key: string, value: any) {
    await this.cache.set(key, value);
  }
}
