import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthGuard42 extends AuthGuard('42') {
  handleRequest(err: unknown, user: unknown): any {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
