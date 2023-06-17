
/* ================================================================================
								room
   ================================================================================ */

interface ChatRoomIF {
	_room_name: string = '';
	_room_password: string = '';
	_room_users: string[] = [];
	_pass: boolean = false;
}
interface popupIF {
	_active: boolean = false;
	_message: string = '';
	_option: {
		_password: string = '';
		_index: number = 0;
		_room: ChatRoomIF = { _room_name: '', _room_password: '' };
	};
}

/* ================================================================================
								chat
   ================================================================================ */

interface ChatMsgIF {
	_msg: string = '';
	_room_name: string = '';
}

interface PayLoadIF {
	_url: string = '';
	_check: boolean = false;
}


/* ================================================================================
								DM
   ================================================================================ */
interface DmChatIF {
	_msg: string = '';
	_from: string = '';
	_to: string = '';
}

interface DmChatStoreIF {
	[opponent: string]: DmChatIF[];
}
