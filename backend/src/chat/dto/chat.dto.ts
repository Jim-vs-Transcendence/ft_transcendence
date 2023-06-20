
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Socket } from 'socket.io';

/* ================================================================================
								room
   ================================================================================ */

export class ChatRoom {
	@IsString()
	_name: string;

	@IsOptional()
	@IsString()
	_password: string;

	@IsObject()
	_user: Map<string, Socket>;

	@IsObject()
	_auth_user: Map<string, number>;

	@IsObject()
	_mute_user: string[];

	@IsObject()
	_ban_user: string[];
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


/* ================================================================================
								chat
   ================================================================================ */

export class ChatUser {
	@IsString()
	_name : string = "";

	@IsString()
	_avatar : string = "";

	@IsNumber()
	_auth : number = 0;

	@IsBoolean()
	_mute : boolean = false;
}

export class ChatRefreshDTO {
	@IsString()
	_name : string = "";

	@IsString()
	_ban : string [] = [];

	@IsObject()
	_user : ChatUser [] = [];
}

export class ChatMsgDTO {
	@IsString()
	readonly _msg: string;
	@IsString()
	readonly _room_name: string;
	@IsString()
	_user_name: string;
}

export class PayLoadDTO {
	@IsString()
	readonly _room: string;

	@IsBoolean()
	_check: boolean;
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
