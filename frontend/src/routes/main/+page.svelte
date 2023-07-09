<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import RoomCreateModal from '../../components/Chat/ChatRoomCreateModal.svelte';
	import RoomJoinModal from '../../components/Chat/ChatRoomJoinModal.svelte';
	import { CreateSocket, socketStore, BlOCKED_USER_KEY } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import type { ChatRoomJoinIF } from '$lib/interface';
	import { gameSocketStore, CreateGameSocket } from '$lib/webSocketConnection_game';
	import { modalStore } from '@skeletonlabs/skeleton';
	import { getApi } from '../../service/api';

	/* ================================================================================
									on
	   ================================================================================ */

	onMount(async () => {
		try {
			if (socket === undefined) await CreateSocket(socketStore);
			if (gameSocket === undefined) await CreateGameSocket(gameSocketStore);
			ft_onMount_room_refresh();
			ft_onMount_room_create();
			ft_onMount_room_join();
		} catch (error) {
			console.log('socket loading error.');
		}
	});

	onDestroy(() => {
		socket.off('room-refresh');
		socket.off('room-create');
		socket.off('room-join');
		unsubscribe();
		unsubscribeGame();
	});

	/* ================================================================================
									socket
	   ================================================================================ */
	let socket: Socket;
	let gameSocket: Socket;

	const unsubscribe = socketStore.subscribe((_socket: Socket) => {
		socket = _socket;
	});

	const unsubscribeGame = gameSocketStore.subscribe((_gameSocket: Socket) => {
		gameSocket = _gameSocket;
	});

	/* ================================================================================
									room refresh
	   ================================================================================ */
	let rooms_list: ChatRoomJoinIF[] = [];
	function ft_onMount_room_refresh() {
		socket.on('room-refresh', (data) => {
			rooms_list = [...data];
		});
		socket.emit('room-refresh', 'page load chat list');
	}

	/* ================================================================================
									room create
	   ================================================================================ */
	function ft_onMount_room_create() {
		socket.on('room-create', (data: ChatRoomJoinIF) => {
			if (!data._pass) return alert('이미 존재하는 방입니다.');
			goto('/main/' + data._room_name);
		});
	}
	function CreateRoom(room_join_data: ChatRoomJoinIF) {
		socket.emit('room-create', room_join_data);
	}

	/* ================================================================================
									room join
	   ================================================================================ */
	function ft_onMount_room_join() {
		socket.on('room-join', (data: ChatRoomJoinIF) => {
			if (data._ban) return alert('추방되셨습니다');
			if (!data._room_name)
				return socket.emit('room-refresh', 'room-join error'), alert('접속 불가');
			if (!data._pass) return alert('비밀번호가 일치하지 않습니다.');
			modalStore.close(); // 이거의 역활??
			goto('/main/' + data._room_name);
		});
	}

	function JoinRoom(room_select: ChatRoomJoinIF) {
		if (room_select._is_passworded) ft_room_join_modal_trigger(room_select);
		else socket.emit('room-join', room_select);
	}

	/* ================================================================================
									room modal
	   ================================================================================ */

	function ft_room_join_modal_trigger(room_select: ChatRoomJoinIF) {
		const modalComponent: ModalComponent = {
			ref: RoomJoinModal
		};
		const modal: ModalSettings = {
			type: 'component',
			// Pass the component directly:
			component: modalComponent,
			response: (_passwd: string) => {
				room_select._room_password = _passwd;
				socket.emit('room-join', room_select);
			}
		};
		modalStore.trigger(modal);
	}

	function ft_room_create_modal_trigger() {
		const modalComponent: ModalComponent = {
			ref: RoomCreateModal
		};
		const modal: ModalSettings = {
			type: 'component',
			// Pass the component directly:
			component: modalComponent,
			response: CreateRoom // $modalstore[0].response = CreateRoom;
		};
		modalStore.trigger(modal);
	}
</script>

<div class="button-container">
	<button type="button" class="btn variant-filled-surface m-1 mt-3" on:click={ft_room_create_modal_trigger}>방 만들기</button>
</div>
<div class="max-h-[80%] grid grid-cols-5 gap-3 overflow-auto">
	{#each rooms_list as room}
		<div
			class="col-start-2 col-span-3 logo-item m-1 variant-filled-surface cursor-pointer"
			id="room"
			on:mousedown={() => {
				JoinRoom(room);
			}}
		>
			{room._room_name}
			{#if room._is_passworded}
				🔒︎
			{/if}
		</div>
	{/each}
</div>

<style>
  .button-container {
    display: flex;
    justify-content: center;
	/* margin: 1px; */
  }

</style>
