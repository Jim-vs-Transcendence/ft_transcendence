import {
  IsOptional,
  IsString,
} from 'class-validator';

export class ChatRoomDTO {
  @IsString()
  readonly _room_name: string;

  @IsOptional()
  @IsString()
  readonly _room_password: string;
}