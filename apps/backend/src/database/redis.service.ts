import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379,
  });

  async get(key: string) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl = 3600) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
