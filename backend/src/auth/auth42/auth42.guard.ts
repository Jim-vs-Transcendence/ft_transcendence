import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthGuard42 extends AuthGuard('42') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const res = context.switchToHttp().getResponse();

    if (err) {
      throw new InternalServerErrorException({
        msg: '42 인증 에러',
        err,
        info,
      });
    }

    if (!user) {
      res.redirect('http://localhost:5173');
    }

    return user;
  }
}
