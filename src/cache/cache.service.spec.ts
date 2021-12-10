import { CACHE_MANAGER } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';

import { CacheService } from './cache.service';

const mockCache = () => ({
  get: jest.fn(),
  set: jest.fn(),
});

describe('CacheService', () => {
  let cacheService: CacheService;
  let cache: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: CACHE_MANAGER, useValue: mockCache() },
      ],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
    cache = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect.assertions(2);
    expect(cacheService).toBeDefined();
    expect(cache).toBeDefined();
  });

  describe('getCacheData', () => {
    it('cache data를 가져오는 데 성공한다', async () => {
      const key = 'key';
      const value = 'value';
      jest.spyOn(cache, 'get').mockResolvedValue(value);

      const result = await cacheService.getCacheData(key);
      expect(result).toEqual(value);
    });
  });

  describe('setCacheData', () => {
    it('cache data를 저장하는 데 성공한다', async () => {
      const key = 'key';
      const value = 'value';
      jest.spyOn(cache, 'set').mockImplementation();

      const result = await cacheService.setCacheData(key, value);
      expect(cache.set).toBeCalled();
    });
  });
});
