import { CacheModule, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Module({
  imports: [CacheModule.register({ ttl: 100000 })],
  providers: [CacheService],
  exports: [CacheService],
})
export class MemoryCacheModule {}
