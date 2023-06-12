import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class ChatRoomDTO {
  @IsString()
  readonly _room_name: string;

  @IsOptional()
  @IsString()
  readonly _room_password: string;
}

export class ChatMsgDTO {
  @IsString()
  readonly _msg: string;

  @IsOptional()
  @IsObject()
  readonly _room_info: ChatRoomDTO;
}

export class PayLoadDTO {
  @IsString()
  readonly _url: string;

  @IsBoolean()
  _check: boolean;
}
