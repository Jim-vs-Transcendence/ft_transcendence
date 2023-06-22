<script lang="ts">
	import { AppShell, Modal, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { getApi, petchApi, postApi, delApi } from '../../service/api';
	import { goto } from '$app/navigation';
	import RoomCreatePopup from '../../components/Chat/ChatRoomCreateModal.svelte';
	import { CreateSocket, socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import type { ChatRoomIF, ChatRoomJoinIF, CreateRoomPopupIF } from '$lib/interface';
	import { gameSocketStore, CreateGameSocket } from '$lib/webSocketConnection_game';
	import { modalStore } from '@skeletonlabs/skeleton';


	let socket: Socket;
	let gameSocket: Socket;

	const unsubscribe = socketStore.subscribe((_socket: Socket) => {
		socket = _socket;
	});

	const unsubscribeGame = gameSocketStore.subscribe((_gameSocket: Socket) => {
		gameSocket = _gameSocket;
	})

	onMount(async () => {
		try {
			if (socket === undefined)
				await CreateSocket(socketStore);

			if (gameSocket === undefined)
				await CreateGameSocket(gameSocketStore);

			/* ===== room-refresh ===== */
			socket.on('room-refresh', (data) => {
				rooms_list = [...data];
			});
			socket.emit('room-refresh', 'page load chat list');

			/* ===== room-create ===== */
			socket.on('room-create', (data: ChatRoomJoinIF) => {
				if (!data._pass)
					return alert(data._room_name + '중복된 이름입니다');
				goto('/main/' + data._room_name);
			});

			/* ===== room-join ===== */
			socket.on('room-join', (data: ChatRoomJoinIF) => {
				if (!data._room_name)
					return socket.emit('room-refresh', 'room-join error'), alert('접속 불가');
				if (!data._pass) 
					return ft_room_join_modal_trigger();
					goto('/main/' + data._room_name);
			});
		} catch (error) {
			console.log('socket loading error.');
		}
	});

	onDestroy(() => {
		/* ===== room-refresh ===== */
		socket.off('room-refresh');
		/* ===== room-create ===== */
		socket.off('room-create');
		/* ===== room-join ===== */
		socket.off('room-join');
		unsubscribe();
		unsubscribeGame();
	});

	/* ================================================================================
									room list
	   ================================================================================ */
	let rooms_list: ChatRoomJoinIF[] = [];

	/* ================================================================================
									room create
	   ================================================================================ */
	function CreateRoom(room_join_data : ChatRoomJoinIF) {
		socket.emit('room-create', room_join_data);
	}

	/* ================================================================================
									room join
	   ================================================================================ */

	let join_password: string = '';
	function JoinRoom(room_select: ChatRoomJoinIF) {
		room_select._pass = false;
		socket.emit('room-join', room_select);
	}
	
	function join_pop_password(room_select: ChatRoomJoinIF) {
		if (!popup_data._option._password)
			popup_data._message = '비밀번호 입력';
		else
			popup_data._message = '비밀번호가 틀렸습니다';
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
									room modal
	   ================================================================================ */

	function ft_room_join_modal_trigger() {
		const modalComponent: ModalComponent = {
			// Pass a reference to your custom component
			ref: RoomCreatePopup,
			// Add the component properties as key/value pairs
			props: { background: 'bg-red-500' },
			// Provide a template literal for the default component slot
			slot: '<p>Skeleton</p>'
		};
		const modal: ModalSettings = {
			type: 'component',
			// Pass the component directly:
			component: modalComponent,
			response: (r: Object) => { console.log(r);}
		};
		modalStore.trigger(modal);
	}

	function ft_room_create_modal_trigger() {
		const modalComponent: ModalComponent = {
			// Pass a reference to your custom component
			ref: RoomCreatePopup,
			// Add the component properties as key/value pairs
			props: { background: 'bg-red-500' },
			// Provide a template literal for the default component slot
			slot: '<p>Skeleton</p>'
		};
		const modal: ModalSettings = {
			type: 'component',
			// Pass the component directly:
			component: modalComponent,
			response: (r: ChatRoomJoinIF) => { console.log(r); }
		};
		modalStore.trigger(modal);
	}
</script>

<!-- -------------------------------------------------------------------  -->
<!-- -------------------------------------------------------------------  -->
<!-- -------------------------------------------------------------------  -->

<!-- <ExampleComponent background="bg-secondary-500 md:bg-primary-500">Skeleton</ExampleComponent> -->
<!-- background 투명하게 변경할 것 -->
<div>
	<div class="button-container">
		<button type="button" class="btn variant-filled-surface centered-button" on:click={ft_room_create_modal_trigger}>방 만들기</button>
	</div>
	<AppShell class="max-h-[80%]  overflow-auto">
		<slot />
		<!-- <lu> -->
			<div class="grid max-h-[70%] max-w-[70%] overflow-auto">
				{#each rooms_list as room}
					<div class="logo-item m-1 variant-filled-surface cursor-pointer" id="room" on:mousedown={() => { JoinRoom(room); }}>
						{room._room_name}
					</div>
				{/each}
			</div>
		</AppShell>
	</div>


<Modal/>

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