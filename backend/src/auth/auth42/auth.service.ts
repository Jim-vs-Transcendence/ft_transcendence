import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { TokenService } from '../token/token.service';
import userDTO from 'src/users/user.dto';
import { Request, Response } from 'express';
import RequestWithUserDTO from '../interfaces/RequestWithUserDTO.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async login(req: RequestWithUserDTO, res: Response): Promise<void> {
    let user: userDTO = await this.usersService.findOne(req.user.id);

    if (!user) user = await this.usersService.saveUser(req.user);

    if (user.two_factor == true)
      res.redirect(this.configService.get<string>('FRONTEND_URL') + 'auth/two/' + user.id);
    else {
      const token: string = await this.tokenService.createToken(req.user.id);
      res.cookie('authtoken_' + req.user.id, token, {
        httpOnly: true,
      });
      res.redirect(this.configService.get<string>('FRONTEND_URL') + 'auth/login/' + user.id);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const header_id: string = await req.header('userid');
    const token = req.cookies['authtoken_' + header_id];
    const userId: string | boolean = await this.tokenService.verifyToken(token);
    if (!userId) return;

    await this.tokenService.deleteToken(userId.toString());

    const user: userDTO = await this.usersService.findOne(userId.toString());
    user.user_status = 0;
    await this.usersService.updateUser(userId.toString(), user);
    res.cookie('authtoken_' + header_id, '', {
      maxAge: 0,
    });
    res.send('logout success');
  }
}
