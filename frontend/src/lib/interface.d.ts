import '../service/userDTO.ts'


/* ================================================================================
								room
   ================================================================================ */

interface ChatRoomIF {
	_room_name: string;
	_room_password: string;
	_room_users: string[];
	_pass: boolean;
}

interface popupIF {
	_active: boolean;
	_message: string;
	_option: {
		_password: string;
		_index: number;
		_room: ChatRoomIF;
	};
}

interface ChatMsgIF {
	_msg: string;
	_user_name: string;
	_room_info: ChatRoomIF;
}

interface PayLoadIF {
	_url: string;
	_check: boolean;
}

/* ================================================================================
								DM
   ================================================================================ */
export interface DmChatIF {
	_msg: string;
	_from: string;
	_to: string;
}

export interface DmChatStoreIF {
	[opponent: string]: DmChatIF[];
}
