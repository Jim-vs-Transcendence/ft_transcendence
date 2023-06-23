<script lang="ts">
	import { AppShell, Modal, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { getApi, petchApi, postApi, delApi } from '../../service/api';
	import { goto } from '$app/navigation';
	import RoomCreateModal from '../../components/Chat/ChatRoomCreateModal.svelte';
	import RoomJoinModal from '../../components/Chat/ChatRoomJoinModal.svelte';
	import { CreateSocket, socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import type { ChatRoomIF, ChatRoomJoinIF, CreateRoomPopupIF } from '$lib/interface';
	import { gameSocketStore, CreateGameSocket } from '$lib/webSocketConnection_game';
	import { modalStore } from '@skeletonlabs/skeleton';
	import ChatRoomJoinModal from '../../components/Chat/ChatRoomJoinModal.svelte';


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
				goto('/main/' + data._room_name);
			});

			/* ===== room-join ===== */
			socket.on('room-join', (data: ChatRoomJoinIF) => {
				console.log('check trigger');
				if (!data._room_name)
					return socket.emit('room-refresh', 'room-join error'), alert('접속 불가');
				if (!data._pass) 
					return alert("비밀번호가 일치하지 않습니다.");
				modalStore.close();
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

	function JoinRoom(room_select: ChatRoomJoinIF) {
		room_select._pass = false;
		if (room_select._is_passworded)
			ft_room_join_modal_trigger(room_select);
		else
			socket.emit('room-join', room_select);
	}

	/* ================================================================================
									room modal
	   ================================================================================ */

	function ft_room_join_modal_trigger(room_select: ChatRoomJoinIF) {
		const modalComponent: ModalComponent = {
			ref: RoomJoinModal,
		};
		const modal: ModalSettings = {
			type: 'component',
			// Pass the component directly:
			component: modalComponent,
			response: (_passwd : string) => { 
				room_select._room_password = _passwd;
				socket.emit('room-join', room_select);
			}
		};
		modalStore.trigger(modal);
	}

	function ft_room_create_modal_trigger() {
		const modalComponent: ModalComponent = {
			ref: RoomCreateModal,
		};
		const modal: ModalSettings = {
			type: 'component',
			// Pass the component directly:
			component: modalComponent,
			response: CreateRoom
		};
		modalStore.trigger(modal);
	}
</script>

<!-- -------------------------------------------------------------------  -->
<!-- -------------------------------------------------------------------  -->
<!-- -------------------------------------------------------------------  -->

<!-- <ExampleComponent background="bg-secondary-500 md:bg-primary-500">Skeleton</ExampleComponent> -->
<!-- background 투명하게 변경할 것 -->
<!-- <AppShell class=""> -->
<div class="button-container">
	<button type="button" class="btn variant-filled-surface centered-button" on:click={ft_room_create_modal_trigger}>방 만들기</button>
</div>
<div class="max-h-[80%] grid grid-cols-5 gap-3 overflow-auto">
	{#each rooms_list as room}
		<div class="col-start-2 col-span-3 logo-item m-1 variant-filled-surface cursor-pointer" id="room"
			on:mousedown={() => { JoinRoom(room); }}>
				{room._room_name} 🔒︎
		</div>
	{/each}
</div>
<!-- </AppShell> -->


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