import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenService } from './token.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}
  async canActivate(context: ExecutionContext): Promise<any | boolean> {
    try {
      const req = await context.switchToHttp().getRequest();
      //헤더
      const token = await req.header('authtoken');
      const login = await req.header('islogin');
      // const token = await req.cookies['auth_token'];
      const userId = await this.tokenService.verifyToken(token);
      if (!await this.tokenService.verifyLogin(userId.toString(), login)) {
        return false;
      }

      req.user = userId;
      return userId;
    } catch (err) {
      return false;
    }
  }
}
