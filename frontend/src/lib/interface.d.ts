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
