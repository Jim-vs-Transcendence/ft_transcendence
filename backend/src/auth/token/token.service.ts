import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign, verify, JsonWebTokenError } from 'jsonwebtoken';
import { loginDTO } from './login.dto';

@Injectable()
export class TokenService {
  private jwtMap: Map<string, loginDTO> = new Map();

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
        { expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME') },
      );
      const login = Math.random().toString(36).substring(2, 12);

      const loginDTO = {
        token: token,
        islogin: login,
      }
      await this.jwtMap.set(userId, loginDTO);
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
      if (token !== this.jwtMap.get(payload['id']).token) return false;
      return payload['id'];
    } catch {
      return false;
    }
  }

  async verifyLogin(userId: string, login: string): Promise<boolean> {
    return await this.jwtMap.get(userId).islogin === login;
  }

  async getToken(userId: string): Promise<loginDTO | undefined> {
    return await this.jwtMap.get(userId);
  }

  async deleteToken(userId: string): Promise<void> {
    await this.jwtMap.delete(userId);
  }
}
