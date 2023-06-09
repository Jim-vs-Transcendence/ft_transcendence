import {
  IsOptional,
  IsString,
} from 'class-validator';

export class ChatRoomDTO {
  @IsString()
  readonly room_name: string;

  @IsOptional()
  @IsString()
  readonly room_password: string;
}