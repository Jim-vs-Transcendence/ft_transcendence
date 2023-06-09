interface popupIF
{
	_active: boolean = false;
	_message: string = "";
	_option: {
		_password :string = "", 
		_index :number = 0,
		_room: ChatRoomIF
	};
};
interface ChatRoomIF {
	_room_name: string = "";
	_room_password: string = "";
}