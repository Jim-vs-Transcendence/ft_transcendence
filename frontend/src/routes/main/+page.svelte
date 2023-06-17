<script lang="ts">
	import { AppShell } from '@skeletonlabs/skeleton';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { getApi, petchApi, postApi, delApi } from '../../service/api';
	import { goto } from '$app/navigation';
	import Popup from '$lib/popup.svelte';
	import { io_chat } from '$lib/webSocketConnection_chat';
	import { onMount } from 'svelte';

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
		goto('/main/' + data._room_name);
	});

	io_chat.on('room-join', (data: ChatRoomIF) => {
		if (!data._room_name) {
			console.log('접속 불가');
			io_chat.emit('room-refresh', 'room-join error');
		}
		goto('/main/' + data._room_name);
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

	onMount(() => {
		io_chat.emit('room-refresh', 'page load chat list');
	})

	// try {
	// 	petchApi( { path: 'user/'+profile_info.id , data:{
	// 		two_factor: false
	// 	},
	// })
	// } catch (error) {
	// 	alert("설정 실패")
	// }
</script>

<!-- <ExampleComponent background="bg-secondary-500 md:bg-primary-500">Skeleton</ExampleComponent> -->
<!-- background 투명하게 변경할 것 -->
<div>

	<div class="button-container">
		<button type="button" class="btn variant-filled-surface centered-button" on:click={ft_popup_create}>Create Room</button>
	</div>
	<AppShell class="max-h-[80%]  overflow-auto">
		<slot />
		<!-- <lu> -->
			<div class="grid max-h-[70%] max-w-[70%] overflow-auto">
				{#each rooms_list as room}
				<div class="logo-item m-1 variant-filled-surface" id="room"
				on:click={() => {
					JoinRoom(room);
				}}>
					{room._room_name}
				</div>
				{/each}
			</div>
		</AppShell>
	</div>

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

<style>
  .button-container {
    display: flex;
    justify-content: center;
	/* margin: 1px; */
  }

  .centered-button {
    margin:  4px;
  }
</style>