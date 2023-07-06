import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify, JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class TokenService {
  private jwtMap: Map<string, string> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async createToken(userId: string): Promise<string> {
    try {
      if (await this.jwtMap.get(userId)) {
        await this.deleteToken(userId);
      }

      const payload: object = { id: userId };
      const token: string = await sign(
        payload,
        this.configService.get<string>('JWT_SECRET'),
      );
      await this.jwtMap.set(userId, token);
      return token;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Failed to create JWT token');
      }
    }
  }

  async verifyToken(token: string): Promise<boolean | string> {
    try {
      const payload: object = await verify(
        token,
        this.configService.get<string>('JWT_SECRET'),
      );
      if (token !== this.jwtMap.get(payload['id'])) return false;
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
