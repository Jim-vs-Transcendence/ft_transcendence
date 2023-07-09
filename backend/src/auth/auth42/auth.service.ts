import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { TokenService } from '../token/token.service';
import userDTO from 'src/users/user.dto';
import { Request, Response } from 'express';
import RequestWithUserDTO from '../interfaces/RequestWithUserDTO.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async login(req: RequestWithUserDTO, res: Response): Promise<void> {
    let user: userDTO = await this.usersService.findOne(req.user.id);

    if (!user) user = await this.usersService.saveUser(req.user);

    if (user.two_factor == true)
      res.redirect('http://localhost:5173/auth/two/' + user.id);
    else {
      const token: string = await this.tokenService.createToken(req.user.id);
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
      });
      res.redirect('http://localhost:5173/auth/login/' + user.id);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    //헤더
    const token: string = await req.header('authtoken');
    //cookie
    // const token = req.cookies['auth_token'];
    const userId: string | boolean = await this.tokenService.verifyToken(token);
    if (!userId) return;

    await this.tokenService.deleteToken(userId.toString());

    const user: userDTO = await this.usersService.findOne(userId.toString());
    user.user_status = 0;
    await this.usersService.updateUser(userId.toString(), user);
    res.cookie('auth_token', '', {
      maxAge: 0,
    });
    res.send('logout success');
  }
}
