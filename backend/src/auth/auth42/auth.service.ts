import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { TokenService } from '../token/token.service';
import userDTO from 'src/users/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async login({ req, res }): Promise<void> {
    let user = await this.usersService.findOne(req.user.id);

    if (!user) user = await this.usersService.saveUser(req.user);

    // res.setHeader('authToken', token);
    // res.cookie('authToken', token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'none',
    // });

    if (user.two_factor == true)
      res.redirect('http://localhost:5173/auth/two/' + user.id);
    else {
      await this.tokenService.createToken(req.user.id);
      res.redirect('http://localhost:5173/auth/login/' + user.id);
    }
  }

  async logout(token: string) {
    const userId = await this.tokenService.verifyToken(token);

    await this.tokenService.deleteToken(userId.toString());

    const user: userDTO = await this.usersService.findOne(userId.toString());
    user.user_status = 0;
    await this.usersService.updateUser(userId.toString(), user);
  }
}
