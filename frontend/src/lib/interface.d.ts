
/* ================================================================================
								room
   ================================================================================ */

interface ChatRoomIF {
	_room_name: string = "";
	_room_password: string = "";
	_room_users: string[] = [];
	_pass: boolean = false;
}

interface popupIF {
	_active: boolean = false;
	_message: string = "";
	_option: {
		_password: string = "";
		_index: number = 0;
		_room: ChatRoomIF = { _room_name: "", _room_password: "" };
	};
}

/* ================================================================================
								chat
   ================================================================================ */

interface ChatMsgIF {
	_msg: string = "";
	_user_name: string = "";
	_room_name: string = "";
}

///////////////////////////
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

interface PayLoadIF {
	_url: string = "";
	_check: boolean = false;
}


/* ================================================================================
								DM
   ================================================================================ */
interface DmChatIF {
	_msg: string = "";
	_from: string = "";
	_to: string = "";
}

interface DmChatStoreIF {
	[opponent: string]: DmChatIF[];
}
