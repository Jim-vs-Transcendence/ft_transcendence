<script lang="ts">
	import { goto } from '$app/navigation';
	import Popup from '$lib/popup.svelte';
	import { CreateSocket, socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';

	let socket: Socket;

	const unsubscribe = socketStore.subscribe((_socket: Socket) => {
		socket = _socket;
	});

	onMount(async () => {
		try {
			if (socket === undefined)
				await CreateSocket(socketStore);

			/* ===== room-refresh ===== */
			socket.on('room-refresh', (data) => {
				rooms_list = [...data];
			});
			socket.emit('room-refresh', 'page load chat list');

			/* ===== room-create ===== */
			socket.on('room-create', (data: ChatRoomIF) => {
				if (!data._pass) return alert(data._room_name + '중복된 이름입니다');
				goto('/main/' + data._room_name);
			});

			/* ===== room-join ===== */
			socket.on('room-join', (data: ChatRoomIF) => {
				if (!data._room_name)
					return socket.emit('room-refresh', 'room-join error'), alert('접속 불가');
				if (!data._pass) return join_pop_password(data);
				goto('/main/' + data._room_name);
			});
		} catch (error) {
			console.log('socket loading error.');
		}
	});

	onDestroy(unsubscribe);

	/* ================================================================================
									room list
	   ================================================================================ */
	let rooms_list: ChatRoomIF[] = [];

	/* ================================================================================
									room create
	   ================================================================================ */

	let room_name: string = '';
	let room_password: string = '';
	function CreateRoom() {
		if (!room_name) {
			alert('방이름을 입력하세요');
			return;
		}
		let send_msg: ChatRoomIF = {
			_room_name: room_name,
			_room_password: room_password,
			_room_users: [],
			_pass: false
		};
		socket.emit('room-create', send_msg);
		room_name = '';
		room_password = '';
		popup_data._active = false;
	}

	function ft_room_create_keydown(e: KeyboardEvent) {
		if (e.keyCode != 13) return;
		CreateRoom();
	}

	/* ================================================================================
									room join
	   ================================================================================ */

	let join_password: string = '';
	function JoinRoom(room_select: ChatRoomIF) {
		room_select._pass = false;
		socket.emit('room-join', room_select);
	}
	function join_pop_password(room_select: ChatRoomIF) {
		if (!popup_data._option._password) popup_data._message = '비밀번호 입력';
		else popup_data._message = '비밀번호 틀렷습니다';
		popup_data._option._room = room_select;
		popup_data._option._index = 2;
		popup_data._active = true;
	}
	function ft_room_pass() {
		popup_data._option._room._room_password = join_password;
		popup_data._option._password = join_password;
		socket.emit('room-join', popup_data._option._room);
	}

	function ft_room_join_keydown(e: KeyboardEvent) {
		if (e.keyCode != 13) return;
		ft_room_pass();
	}

	/* ================================================================================
									room pop
	   ================================================================================ */

	let popup_data: popupIF = {
		_active: false,
		_message: '',
		_option: {
			_index: 0,
			_password: '',
			_room: {
				_room_name: '',
				_room_password: '',
				_room_users: [],
				_pass: false
			}
		}
	};
	let ClosePopup = (event: any) => {
		popup_data._active = false;
		room_name = '';
		room_password = '';
		join_password = '';
	};
	function ft_popup_create() {
		popup_data._active = true;
		popup_data._message = '방 생성';
		popup_data._option._index = 1;
	}
</script>

<!-- -------------------------------------------------------------------  -->
<!-- -------------------------------------------------------------------  -->
<!-- -------------------------------------------------------------------  -->
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
			<input type="password" on:keydown={ft_room_join_keydown} bind:value={join_password} />
			<button on:click={ft_room_pass}> 확인</button>
		</form>
	{/if}
</Popup>
