import '../service/userDTO.ts'

/* ================================================================================
								room
   ================================================================================ */

interface ChatRoomIF {
	_name: string;
	_password: string;
	_users: Map<string, userDTO>;
	_auth_user: Map<string, number>;
	_mute_user: string[];
	_ban_user: string[];
}

interface ChatRoomJoinIF {
	_room_name: string;
	_room_password: string;
	_is_passworded: boolean;
	_pass: boolean;
}

interface CreateRoomPopupIF {
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
	_room_name: string;
}

interface RoomCheckIF {
	_url: string;
	_check: boolean;
}


/* ================================================================================
								chat
   ================================================================================ */


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

////////////////////////////

interface ChatAuthDTO{
	_room : string;
	_option : number;
	_user_grantor : string;
	_user_heritor : string;
	_check : boolean;
}
/* ================================================================================
								DM
   ================================================================================ */
interface DmChatIF {
	_msg: string;
	_from: string;
	_to: string;
}

interface DmUserInfoIF {
	_avatar: string;
	_dmChatStore: DmChatIF[];
}

interface DmChatStoreIF {
	[opponent: string]: DmUserInfoIF;
}
