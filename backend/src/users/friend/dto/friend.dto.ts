import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { FriendRequestStatus } from 'src/users/entities/friend.entity';

export class friendDTO {
  @ApiProperty({ description: '인트라 내부 id' })
  @IsString()
  id: string;

  @ApiProperty({ description: '유저 닉네임' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '이미지 주소' })
  @IsString()
  avatar: string;

  @ApiProperty({
    description: '유저 상태 (0: 오프라인, 1: 온라인, 2: 게임중, 3: 채팅중)',
  })
  @IsNumber()
  status: number;

  @ApiProperty({ description: '친구 상태' })
  @IsString()
  friendStatus: FriendRequestStatus;
}

export default friendDTO;
