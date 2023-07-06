import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenService } from './token.service';
import { Request } from 'express';
import RequestWithUser from '../interfaces/RequestWithUserID.interface';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}
  async canActivate(context: ExecutionContext): Promise<any | boolean> {
    try {
      const req: RequestWithUser = await context.switchToHttp().getRequest();
      //헤더
      const token: string = await req.header('authtoken');
      // const token: string = await req.cookies['auth_token'];
      const userId: string | boolean = await this.tokenService.verifyToken(
        token,
      );

      req.user = userId.toString();
      return userId;
    } catch (err) {
      return false;
    }
  }
}
