import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class TokenService {
  private jwtMap: Map<string, string> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async createToken(userId: string): Promise<string> {
    if (await this.jwtMap.get(userId)) {
      await this.deleteToken(userId);
    }

    const payload = { id: userId };
    const token = await sign(
      payload,
      this.configService.get<string>('JWT_SECRET'),
      );
    this.jwtMap.set(userId, token);
    return token;
  }

  async verifyToken(token: string): Promise<boolean | string> {
    try {
      const payload = await verify(
        token,
        this.configService.get<string>('JWT_SECRET'),
        );
      if (token != this.jwtMap.get(payload['id'])) return false;
      return payload['id'];
    } catch {
      return false;
    }
  }

  async getToken(userId: string): Promise<string | undefined> {
    return await this.jwtMap.get(userId);
  }

  async deleteToken(userId: string): Promise<void> {
    await this.jwtMap.delete(userId);
  }
}
