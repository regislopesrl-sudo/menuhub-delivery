import { Injectable } from '@nestjs/common';
import { RedisService } from '@/database/redis.service';
import { BotSession } from './types';

@Injectable()
export class SessionService {
  constructor(private redis: RedisService) {}

  async getOrCreate(phone: string): Promise<BotSession> {
    const key = `session:${phone}`;
    const existing = await this.redis.get(key);
    if (existing) return existing;

    const session: BotSession = {
      phone,
      state: 'START',
      cart: [],
      updatedAt: Date.now(),
    };

    await this.redis.set(key, session);

    return session;
  }

  async save(session: BotSession): Promise<void> {
    const key = `session:${session.phone}`;
    session.updatedAt = Date.now();
    await this.redis.set(key, session);
  }

  async reset(phone: string): Promise<void> {
    const key = `session:${phone}`;
    await this.redis.del(key);
  }

  async markHandoff(phone: string): Promise<void> {
    const session = await this.getOrCreate(phone);
    session.state = 'HUMAN_HANDOFF';
    session.handoff = true;
    await this.save(session);
  }
}
