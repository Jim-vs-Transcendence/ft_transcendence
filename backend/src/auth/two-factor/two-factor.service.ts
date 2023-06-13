import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { toDataURL } from 'qrcode';
import { TokenService } from '../token/token.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly userService: UsersService,
    private readonly tokenServiece: TokenService,
  ) {}

  async generateTwoFactorAuthenticationSecret(userId: string) {
    const secret = authenticator.generateSecret();

    const user: User = await this.userService.findOne(userId);

    user.two_factor_secret = secret;
    await this.userService.updateUser(userId, user);

    const otpauthUrl = await authenticator.keyuri(
      userId,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      secret,
    );

    return {
      secret,
      otpauthUrl,
    };
  }

  async QRtoDataURL(otpauthUrl: string): Promise<string> {
    return await toDataURL(otpauthUrl);
  }

  async isTwoFactorAuthenticationCodeValid(
    userId: string,
    twoFactorAuthenticationCode: string,
  ) {
    const user: User = await this.userService.findOne(userId);
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.two_factor_secret,
    });
  }

  async twoFactorLogin(id: string, twoFactorAuthenticationCode: string) {
    const isCodeValidated = await this.isTwoFactorAuthenticationCodeValid(
      id,
      twoFactorAuthenticationCode,
    );

    if (isCodeValidated == true) await this.tokenServiece.createToken(id);

    return isCodeValidated;
  }

  // async deleteSecret(userId: string) : Promise<boolean> {
  //   const user: User = await this.userService.findOne(userId);

  //   user.two_factor = false;
  //   user.two_factor_secret = "";

  //   this.userService.updateUser(userId, user);

  // }
}
