
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString, isBoolean, isEnum, isObject } from 'class-validator';
import userDTO from 'src/users/user.dto';

/* ================================================================================
								chat room join interface
   ================================================================================ */

export enum Authority {
	OWNER,
	MANAGER,
	USER,
}

export class ChatRoomDTO {
	@IsString()
	_name: string;

	@IsOptional()
	@IsString()
	_password: string;

	@IsObject()
	_users: Map<string, ChatUserDTO>;

	@IsObject()
	_ban_user: string[];
}

export class ChatRoomSendDTO {
	@IsString()
	_name: string;

	@IsOptional()
	@IsString()
	_password: string;

	@IsObject()
	_users: Array<[string, ChatUserDTO]>;

	@IsObject()
	_ban_user: string[];

	@IsObject()
	_user_self: ChatUserDTO;
}

export class ChatUserDTO {
	@IsObject()
	_authority: Authority;

	@IsBoolean()
	_is_muted: boolean;

	@IsObject()
	_user_info: userDTO;
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
	
	@IsBoolean()
	_ban: boolean;
}


/* ================================================================================
								In chat room
   ================================================================================ */

export class RoomCheckDTO {
	@IsObject()
	_user: ChatUserDTO;

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

	@IsString()
	_user_avatar: string;
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


export class ChatActionDTO {
	@IsString()
	readonly _user_from: string;

	@IsString()
	readonly _user_to: string;

	@IsString()
	readonly _channel_name: string;

	@IsString()
	readonly _action: string;
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
