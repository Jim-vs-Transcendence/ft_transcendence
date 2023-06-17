import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import exp from 'constants';
import { Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';

/////////////////


export class ChatUser {
	@IsString()
	_socket: Socket;

	@IsString()
	_channel: string [];

}


export class ChatRoom {
	@IsString()
	_name: string;

	@IsOptional()
	@IsString()
	_password: string;

	@IsObject()
	_user: Map<string, ChatUser>;

	@IsObject()
	_auth_user: Map<string, number>;
}

export class ChatRoomDTO {
	@IsString()
	_room_name: string;

	@IsString()
	_room_password: string;

	@IsString()
	_room_users: string[];

	@IsBoolean()
	_pass: boolean;

}

/////////////////////

export class ChatMsgDTO {
  @IsString()
  readonly _msg: string;

  @IsOptional()
  @IsObject()
  readonly _room_info: ChatRoomDTO;
}

export class PayLoadDTO {
  @IsString()
  readonly _room: string;

  @IsBoolean()
  _check: boolean;
}

export class DmChatDTO {
	@IsString()
	readonly _msg: string;
  
	@IsString()
	readonly _from: string;

	@IsString()
	readonly _to: string;
  }
