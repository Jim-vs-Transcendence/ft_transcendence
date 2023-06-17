import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class userDTO {
  @ApiProperty({ description: '인트라 내부 id' })
  @IsString()
  id: string;

  @ApiProperty({ description: '유저 닉네임' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '인트라 이메일 주소' })
  @IsString()
  email: string;

  @ApiProperty({ description: '이미지 주소' })
  @IsString()
  avatar: string;

  @ApiProperty({ description: '승리 횟수' })
  @IsNumber()
  win: number;

  @ApiProperty({ description: '패배 횟수' })
  @IsNumber()
  lose: number;

  @ApiProperty({ description: '레벨' })
  @IsNumber()
  level: number;

  @ApiProperty({
    description: '유저 상태 (0: 오프라인, 1: 온라인, 2: 게임중, 3: 채팅중)',
  })
  @IsNumber()
  user_status: number;

  @ApiProperty({ description: 'two-factor 사용 여부 (0: 비활성화, 1: 활성화)' })
  @IsBoolean()
  two_factor: boolean;

  @ApiProperty({ description: 'two-factor secret two-factor 인증시 사용' })
  @IsString()
  two_factor_secret: string;
}

export default userDTO;
