interface popupIF {
	_active: boolean = false;
	_message: string = '';
	_option: {
		_password: string = '';
		_index: number = 0;
		_room: ChatRoomIF = { _room_name: '', _room_password: '' };
	};
}

interface ChatRoomIF {
	_room_name: string = '';
	_room_password: string = '';
	_room_users: string [] = [];
}

interface ChatMsgIF {
	_msg: string = '';
	_room_info: ChatRoomIF;
}

interface PayLoadIF {
	_url: string = '';
	_check: boolean = false;
}

interface DmChatIF {
	_msg: string = '';
	_from: string = '';
	_to: string = '';
}

interface DmChatStoreIF {
	[opponent : string] : DmChatIF[];
}
