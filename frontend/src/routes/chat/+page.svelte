<script lang="ts">
	import { goto } from '$app/navigation';
	import Popup from '$lib/popup.svelte';
	import { io_chat } from '$lib/webSocketConnection_chat';

	let rooms_list: ChatRoomIF[] = [];
	let room_name: string = '';
	let room_password: string = '';
	let popup_data: popupIF = {
		_active: false,
		_message: '',
		_option: {
			_index: 0,
			_password: '',
			_room: {
				_room_name: '',
				_room_password: ''
			}
		}
	};

	io_chat.on('room-refresh', (data: ChatRoomIF[]) => {
		rooms_list = [...data];
	});

	io_chat.on('room-create', (data: ChatRoomIF) => {
		console.log(data);
		if (!data._room_name) console.log('생성 불가');
		goto('/chat/' + data._room_name);
	});

	io_chat.on('room-join', (data: ChatRoomIF) => {
		if (!data._room_name) {
			console.log('접속 불가');
			io_chat.emit('room-refresh', 'room-join error');
		}
		goto('/chat/' + data._room_name);
	});

	function CreateRoom() {
		if (!room_name) {
			alert('방이름을 입력하세요');
			return;
		}
		let send_msg: ChatRoomIF = { _room_name: room_name, _room_password: room_password };
		io_chat.emit('room-create', send_msg);
		room_name = '';
		room_password = '';
		popup_data._active = false;
	}

	function JoinRoom(room_select: ChatRoomIF) {
		console.log('[' + room_select._room_password + ']');
		if (room_select._room_password == '') {
			io_chat.emit('room-join', room_select);
			return;
		}
		popup_data._message = 'password input';
		popup_data._option._room = room_select;
		popup_data._option._index = 2;
		popup_data._active = true;
	}

	function ft_success_password() {
		console.log(popup_data._option._room._room_password);
		console.log(room_password);
		if (room_password == popup_data._option._room._room_password) {
			io_chat.emit('room-join', popup_data._option._room);
			popup_data._active = false;
		}
		popup_data._message = '비밀번호가 틀렷습니다';
	}

	let ClosePopup = (event: any) => {
		popup_data._active = false;
	};

	function ft_room_create_keydown(e: KeyboardEvent) {
		if (e.keyCode != 13) return;
		CreateRoom();
	}

	function ft_popup_create() {
		popup_data._active = true;
		popup_data._message = '방 생성';
		popup_data._option._index = 1;
	}
</script>

<lu>
	{#each rooms_list as room}
		<li
			id="room"
			on:mousedown={() => {
				JoinRoom(room);
			}}
			style="padding: 20px; color: #00a; background-color: #aa3; width: 50%; margin: auto; border: solid #455 11px;"
		>
			{room._room_name}
		</li>
	{/each}
</lu>

<button on:click={ft_popup_create}> CreateRoom </button>
<Popup bind:property={popup_data} on:mousedown={ClosePopup}>
	{#if popup_data._option._index == 1}
		<input type="text" on:keydown={ft_room_create_keydown} bind:value={room_name} />
		<input type="password" on:keydown={ft_room_create_keydown} bind:value={room_password} />
		<button on:click={CreateRoom}>방만들기</button>
	{/if}
	{#if popup_data._option._index == 2}
		<form>
			<input type="password" bind:value={room_password} />
			<button on:click={ft_success_password}> 확인</button>
		</form>
	{/if}
</Popup>
