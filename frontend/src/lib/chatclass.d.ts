
class ChatUserInfo
{
	_name : string = "";
	_avatar : string = "";
	_auth : number = 0;
	_mute : boolean = false;
}

class ChatRoomInfo
{
	_name : string = "";
	_user : ChatUserInfo <string, ChatUserInfo> = [];
	_ban : string [] = [];
}
