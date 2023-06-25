
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Socket } from 'socket.io';
import userDTO from 'src/users/user.dto';

/* ================================================================================
								chat room join interface
   ================================================================================ */

export class ChatRoomDTO {
	@IsString()
	_name: string;

	@IsOptional()
	@IsString()
	_password: string;

	@IsObject()
	_users: Map<string, userDTO>;

	@IsObject()
	_auth_user: Map<string, number>;

	@IsObject()
	_mute_user: string[];

	@IsObject()
	_ban_user: string[];
}

export class ChatRoomJoinDTO {
	@IsString()
	_room_name: string;

	@IsString()
	_room_password: string;

	@IsBoolean()
	_is_passworded: boolean;

	@IsBoolean()
	_pass: boolean;
}


/* ================================================================================
								In chat room
   ================================================================================ */
   
export class RoomCheckDTO {
	@IsString()
	readonly _room: string;

	@IsBoolean()
	_check: boolean;
}

export class ChatMsgDTO {
	@IsString()
	readonly _msg: string;

	@IsString()
	readonly _room_name: string;

	@IsString()
	_user_name: string;
}

export class ChatAuthDTO {
	@IsString()
	readonly _room: string;

	@IsNumber()
	readonly _option: number;

	@IsString()
	readonly _user_grantor: string;

	@IsString()
	readonly _user_heritor: string;

	@IsBoolean()
	_check: boolean;
}

/* ================================================================================
								DM
   ================================================================================ */


export class DmChatDTO {
	@IsString()
	readonly _msg: string;

	@IsString()
	readonly _from: string;

	@IsString()
	readonly _to: string;
}
