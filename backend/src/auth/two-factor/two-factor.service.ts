import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UsersService } from 'src/users/users.service';
import { toDataURL } from 'qrcode';
import { TokenService } from '../token/token.service';
import userDTO from 'src/users/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly tokenServiece: TokenService,
  ) {}

  async generateTwoFactorSecret(userId: string) {
    const secret = authenticator.generateSecret();

    const user: userDTO = await this.userService.findOne(userId);

    user.two_factor_secret = secret;
    await this.userService.updateUser(userId, user);

    const otpauthUrl = await authenticator.keyuri(
      userId,
      this.configService.get<string>('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
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

  async isTwoFactorCodeValid(userId: string, twoFactorCode: string) {
    const user: userDTO = await this.userService.findOne(userId);
    return authenticator.verify({
      token: twoFactorCode,
      secret: user.two_factor_secret,
    });
  }

  async twoFactorLogin(id: string, twoFactorCode: string) {
    const isCodeValidated = await this.isTwoFactorCodeValid(id, twoFactorCode);

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
