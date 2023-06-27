import '../service/userDTO'
import '$lib/enum'
/* ================================================================================
								chat room join interface
   ================================================================================ */

interface ChatRoomIF {
	_name: string;
	_password: string;
	_users: Map<string, ChatUserIF>;
	_ban_user: string[];
}

interface ChatRoomSendIF {
	_name: string;
	_password: string;
	_users: Array<[string, ChatUserIF]>;
	_ban_user: string[];
}

interface ChatUserIF {
	_authority: Authority;
	_is_muted: boolean;
	_user_info: UserDTO;
}

interface ChatRoomJoinIF {
	_room_name: string;
	_room_password: string;
	_is_passworded: boolean;
	_pass: boolean;
	_ban: boolean;
}

/* ================================================================================
								In chat room
   ================================================================================ */

interface RoomCheckIF {
	_user: ChatUserIF;
	_url: string;
	_check: boolean;
}

interface ChatMsgIF {
	_msg: string;
	_room_name: string;
	_user_name: string;
}

interface ChatAuthDTO {
	_room: string;
	_option: number;
	_user_grantor: string;
	_user_heritor: string;
	_check: boolean;
}

interface ChatActionDTO {
	_action: string;
	_channel_name: string;
	_user_from: string;
	_user_to: string;
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
	// _avatar: string; // to be removed
	_userInfo: userDTO; // avatar, nickname
	_dmChatStore: DmChatIF[];
}

// 브라우저에 로그인한 나 자신의 데이터는 넣지 않는다. onMount로 그때 그때 가져와서 해당 컴포넌트의 변수로 가지고 있는다.
// 이런식으로 profile정보 바뀐 것도 갱신되어서 쓸수 있게 한다.
interface DmChatStoreIF {
	[opponent: string]: DmUserInfoIF;
}
