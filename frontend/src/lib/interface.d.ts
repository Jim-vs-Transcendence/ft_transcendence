interface popupIF {
	_active: boolean = false;
	_message: string = '';
	_option: {
		_password: string = '';
		_index: number = 0;
		_room: ChatRoomIF = { _room_name: '', _room_password: '' };
	};
}


enum Authority {
    OWNER,
    ADMIN,
    USER,
}
interface ChatUserIF {
    _authority: Authority;
    _is_muted: boolean;
    _user_id: string;
}

interface ChatRoomIF {
    _room_name: string = '';
    _room_password: string = '';
    _participant_list: ChatUserIF[] = [];
    _banned_list: string[] = [];
}

interface ChatMsgIF {
	_msg: string = '';
	_room_info: ChatRoomIF;
}

interface PayLoadIF {
	_url: string = '';
	_check: boolean = false;
}
