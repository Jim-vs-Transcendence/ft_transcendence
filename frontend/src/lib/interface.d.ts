import '../service/userDTO.ts'

interface popupIF {
	_active: boolean;
	_message: string;
	_option: {
		_password: string;
		_index: number;
		_room: ChatRoomIF;
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
  	_user_info: UserDTO; // temp OAuth되면 user단에서 만든 함수 이용해서  userinfo를 가져올 예정
}

interface ChatRoomIF {
    _room_name: string;
    _room_password: string;
    _participant_list: ChatUserIF[];
    _banned_list: string[];
}

interface ChatMsgIF {
	_msg: string;
	_room_info: ChatRoomIF;
}

interface PayLoadIF {
	_url: string;
	_check: boolean;
}
