import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class twoFactorDTO {
  @ApiProperty({ description: 'Google Authentication OTP' })
  @IsString()
  twoFactorAuthenticationCode: string;
}

export default twoFactorDTO;
