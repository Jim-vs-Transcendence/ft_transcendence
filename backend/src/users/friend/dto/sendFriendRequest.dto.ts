import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendFriendRequestDTO {
  @ApiProperty({ description: '요청을 보낼 친구의 id' })
  @IsString()
  user_to: string;
}

export default SendFriendRequestDTO;
