<script lang="ts">
	import '../../../service/userDTO'
	import { Avatar, Tab, TabGroup } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { ChatAuthDTO, ChatMsgIF, ChatRoomIF, ChatRoomSendIF, RoomCheckIF } from '$lib/interface';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import ChatUserList from '../../../components/Chat/ChatUserList.svelte';
	import ChatUserOptions from '../../../components/Chat/ChatUserOptions.svelte';
	import type { Unsubscriber } from 'svelte/store';
	
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	let socket: Socket;
	let userid: string
	let room : ChatRoomSendIF;
	let msg_list: ChatMsgIF[] = [];
	let chat_data: ChatMsgIF = {
		_msg: '',
		_user_name: '',
		_room_name: $page.params['chat_room']
	};
	let tabSet: number = 0;
	let chatUserList : Map<string, UserDTO>;

	const unsubscribe : Unsubscriber = socketStore.subscribe((_socket: Socket) => {
		socket = _socket;
	});
	
	onMount(async () => {
		try {
			if (socket === undefined)
				await goto("/main");
			/* ===== chat-connect ===== */
			chat_data._room_name = $page.params['chat_room'];
			
			socket.emit('chat-connect', { _room: $page.params['chat_room'], _check: true });
			
			await socket.on('chat-connect', (data: RoomCheckIF) => {
				if (!data._check) {
					alert("잘못된 접근입니다");
					goto("/main");
				}
				else
					userid = data._uid;
			});
			
			socket.emit("chat-refresh", $page.params['chat_room']);
	
			/* ===== chat-refresh ===== */
			socket.on('chat-refresh', (data: ChatRoomSendIF | string) => {
				console.log(data);
				if (typeof data === 'object')
					room = data;
				else
				{
					console.log("chat refresh error");
					socket.emit("chat-refresh", $page.params['chat_room']);
				}
			})
	
			/* ===== chat-msg-even ===== */
			socket.on('chat-msg-event', (data: ChatMsgIF) => {
				console.log("chat-msg-event : ", data);
				msg_list = [...msg_list, data];
			});
			/* ===== chat-set-admin ===== */
			socket.on('chat-set-admin', (data: ChatAuthDTO) => {
				if (!data._check)
					return alert("권한 설정 실패");
				/// 권한 변경 
			});
		}
		catch {
			console.log("error");
		}
	});

	onDestroy(() => {
		unsubscribe();
		if (socket !== undefined)
		{
			socket.off('chat-connect');
			socket.off('chat-refresh');
			socket.off('chat-msg-event');
			socket.off('chat-set-admin');
			socket.emit('chat-exit-room', chat_data);
		}
	});

	/* ================================================================================
									chat msg
	   ================================================================================ */

	function ft_chat_send_msg() {
		if (chat_data._msg.length && chat_data._msg != '\n')
			socket.emit('chat-msg-event', chat_data);
		chat_data._msg = '';
		console.log(userid);
	}

	function ft_chat_send_msg_keydown(e: KeyboardEvent) {
		if (e.keyCode != 13) return;
		ft_chat_send_msg();
	}

	function ft_exit_chat_room() {
		goto('/');
	}
</script>

<svelte:window on:popstate={() => goto("/main")}/>
{#if room !== undefined}
<div class="w-full h-full grid grid-cols-[auto_1fr] gap-1" style="height: calc(90% - 64px)">
	<div class="bg-surface-500/30 p-10">
		<TabGroup>
			<Tab bind:group={tabSet} name="tab1" value={0}> 채팅방 유저</Tab>
				<!-- {#if } -->
			<Tab bind:group={tabSet} name="tab2" value={1}> 거절된 유저</Tab>
				<!-- {/if} -->
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					{#each [... room._users] as [userid, chatUser]}
						<ChatUserList {userid} {chatUser}/>
					{/each}
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
	<div class="bg-surface-500/30 p-4">
		{#each msg_list as msg}
			{#if (msg._user_name == userid)}
				<div class="grid grid-cols-[auto_1fr] gap-5">
					<Avatar src="https://i.pravatar.cc/?img={'bubble.avatar'}" width="w-12" />
					<div class="card p-4 variant-soft rounded-tl-none space-y-2">
						<header class="flex justify-between items-center">
							<p class="font-bold">{msg._user_name}</p>
						</header>
						<p class="font-bold">{msg._msg}</p>
					</div>
				</div>
			{:else}
				<div class="grid grid-cols-[1fr_auto] gap-2">
					<div class="card p-4 rounded-tr-none space-y-2 {'bubble.color'}">
						<header class="flex justify-between items-center">
							<p class="font-bold">{ msg._user_name}</p>
							<small class="opacity-50">{msg._user_name}</small>
						</header>
						<p class="font-bold">{msg._msg}</p>
					</div>
					<Avatar src="https://i.pravatar.cc/?img={'bubble.avatar'}" width="w-12" />
				</div>
			{/if}
		{/each}

		<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
			<button class="input-group-shim">+</button>
			<textarea
				bind:value={chat_data._msg}
				on:keyup={ft_chat_send_msg_keydown}
				class="bg-transparent border-0 ring-0"
				name="prompt"
				id="prompt"
				placeholder="Write a message..."
				rows="1"
			/>
			<button class="variant-filled-primary text_input_btn" on:click={ft_chat_send_msg}>Send</button>
		</div>
	</div>
	<div>
		<button type="button" on:click={ () => { ft_exit_chat_room()}}   >  뒤로가기 </button>
	</div>
</div>
{/if}
