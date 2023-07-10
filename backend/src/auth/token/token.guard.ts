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
      const login: string = await req.header('islogin');
      const header_id: string = await req.header('userid');
      const token: string = await req.cookies['authtoken_' + header_id];
      const userId = await this.tokenService.verifyToken(token);
      if (userId.toString() !== header_id) return false;
      if (!await this.tokenService.verifyLogin(userId.toString(), login)) {
        return false;
      }

      req.user = userId.toString();
      return userId;
    } catch (err) {
      return false;
    }
  }
}
