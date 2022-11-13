import { CacheService } from './cache.service';
import { ConfigService } from '../config/config.service';
import Redis from 'ioredis';

describe('CacheService', () => {
  let configService: ConfigService;
  let redis: Redis;
  let cacheService: CacheService;

  beforeEach(async () => {
    configService = {
      REDIS_TTL_MS: 1,
    } as ConfigService;
    redis = {
      get: () => {},
      psetex: () => {},
      del: () => {},
    } as unknown as Redis;
    cacheService = new CacheService(configService, redis);
  });

  describe('get', () => {
    it('should resolve json-parsed results on cache hit', async () => {
      const cacheKey = 'foo';
      const cacheValue = { foo: 'bar' };

      jest.spyOn(redis, 'get').mockImplementation((key, cb) => {
        cb(undefined, JSON.stringify(cacheValue));
        return null;
      });

      const result = await cacheService.get(cacheKey);
      expect(result).toEqual(cacheValue);

      expect(redis.get).toHaveBeenCalledWith(cacheKey, expect.anything());
    });

    it('should resolve null on cache miss', async () => {
      jest.spyOn(redis, 'get').mockImplementation((key, cb) => {
        cb();
        return null;
      });

      const result = await cacheService.get('foo');
      expect(result).toBeNull();
    });

    it('should reject on error', async () => {
      let err = new Error('oops');

      jest.spyOn(redis, 'get').mockImplementation((key, cb) => {
        cb(err);
        return null;
      });

      await expect(cacheService.get('foo')).rejects.toThrow(err);
    });
  });

  describe('set', () => {
    it('should resolve on success', async () => {
      const cacheKey = 'foo';
      const cacheValue = { foo: 'bar' };
      const cacheTtl = 50;

      jest.spyOn(redis, 'psetex').mockImplementation((key, ttl, val, cb) => {
        cb();
        return null;
      });

      await cacheService.set(cacheKey, cacheValue, cacheTtl);

      expect(redis.psetex).toHaveBeenCalledWith(
        cacheKey,
        cacheTtl,
        JSON.stringify(cacheValue),
        expect.anything(),
      );
    });

    it('should use the default ttl from config when not passed', async () => {
      const cacheKey = 'foo';
      const cacheValue = { foo: 'bar' };

      jest.spyOn(redis, 'psetex').mockImplementation((key, ttl, val, cb) => {
        cb();
        return null;
      });

      await cacheService.set(cacheKey, cacheValue);

      expect(redis.psetex).toHaveBeenCalledWith(
        cacheKey,
        configService.REDIS_TTL_MS,
        JSON.stringify(cacheValue),
        expect.anything(),
      );
    });

    it('should reject on error', async () => {
      let err = new Error('oops');

      jest.spyOn(redis, 'psetex').mockImplementation((key, ttl, val, cb) => {
        cb(err);
        return null;
      });

      await expect(cacheService.set('foo', 'bar')).rejects.toThrow(err);
    });
  });

  describe('delete', () => {
    it('should resolve on success', async () => {
      const cacheKeys = ['a', 'b', 'c'];

      // @ts-ignore
      jest.spyOn(redis, 'del').mockImplementation((keys, cb) => {
        cb();
        return null;
      });

      await cacheService.delete(...cacheKeys);

      expect(redis.del).toHaveBeenCalledWith(cacheKeys, expect.anything());
    });

    it('should reject on error', async () => {
      let err = new Error('oops');

      // @ts-ignore
      jest.spyOn(redis, 'del').mockImplementation((keys, cb) => {
        cb(err);
        return null;
      });

      await expect(cacheService.delete('a', 'b')).rejects.toThrow(err);
    });
  });
});
