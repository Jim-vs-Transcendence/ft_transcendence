import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class twoFactorDTO {
  @ApiProperty({ description: 'Google Authentication OTP' })
  @IsString()
  twoFactorCode: string;
}

export default twoFactorDTO;
