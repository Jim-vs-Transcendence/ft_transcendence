<script lang="ts">

import { goto } from '$app/navigation';
import { io_chat } from '$lib/webSocketConnection_chat';

let rooms_list: ChatRoomIF[] = [];
let room_name: string;
let room_password: string;

io_chat.on('room-refresh', (data: ChatRoomIF []) => {
    rooms_list = [...data];
});

io_chat.on('room-create', (data: ChatRoomIF) => {
	if (!data.room_name)
		console.log("생성 불가");
    console.log(data);
});

io_chat.on('room-join', (data: ChatRoomIF) => {
	if (!data.room_name)
	{
		console.log("접속 불가");
		io_chat.emit("room-refresh", "room-join error");
	}
	goto("/chat/" + data.room_name);
});

function JoinRoom(room_select: ChatRoomIF) {
	console.log();
	io_chat.emit("room-join", room_select);
};

function CreateRoom(): boolean{
	if (!room_name)
	{
		alert("방이름을 입력하세요");
		return false;
	}
	// if (room_password) // 이건 옵션이다
	// 	return false;
    io_chat.emit('room-create', {"room_name": room_name, "room_password": room_password} );
	room_name = '';
	room_password = '';
	return true;
};

let ClosePopup = (event: any) => {
    // 추후 협의
};

function ft_room_create_keydown(e : KeyboardEvent) {
	if (e.keyCode != 13)
		return ;
	CreateRoom();
}

</script>

<lu>
    {#each rooms_list as room}
    <li id="room" on:mousedown={() => { JoinRoom(room) }} style="padding: 20px; color: #00a; background-color: #aa3; width: 50%; margin: auto; border: solid #455 11px;" >
        {room.room_name}
    </li>
    {/each}
    <input type="text" on:keydown={ft_room_create_keydown} bind:value={room_name} />
    <input type="password" on:keydown={ft_room_create_keydown} bind:value={room_password} />
    <button on:click={CreateRoom}> CreateRoom </button>
    <button on:click={ClosePopup}> ClosePopup </button>
</lu>
