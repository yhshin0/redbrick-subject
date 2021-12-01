import { CacheModule, Module } from '@nestjs/common';

import { CACHE_CONSTANTS } from './cache.constants';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.register({ ttl: CACHE_CONSTANTS.TIME_TO_LIVE_SECONDS }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class MemoryCacheModule {}
