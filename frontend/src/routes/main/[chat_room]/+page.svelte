<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';
	import { each } from 'svelte/internal';
	import ChatUserList from '../../../components/Chat/ChatUserList.svelte'
	import type { PayLoadIF, ChatUserIF, ChatMsgIF } from '$lib/interface.d'

	let socket: Socket;

	const unsubscribe = socketStore.subscribe((_socket: Socket) => {
		socket = _socket;
	});

	onMount(() => {
		/* ===== chat-connect ===== */
		socket.on('chat-connect', (data: PayLoadIF) => {
			if (!data._check) console.log('PayLoad false');
			// or popup 잘못된 접근입니다 확인 => goto (/main);
		});
		socket.emit('chat-connect', { _room: $page.params['chat_room'], _check: true });

		/* ===== chat-msg-even ===== */
		socket.on('chat-msg-event', (data: ChatMsgIF) => {
			msg_list = [...msg_list, data];
		});

		/* ===== chat-msg-even ===== */
	});

	onDestroy(unsubscribe);

	/* ================================================================================
									chat msg
	   ================================================================================ */

	let msg_list: ChatMsgIF[] = [];
	let data: PayLoadIF; // extern
	// for profile
  // dummy data for test
	const  chatUserList: ChatUserIF[] = [
		{
			_authority: 1,
			_is_muted: false,
			_user_id: "jim",
			_user_info: {
				id: "jim",
				nickname: "nickname",
				avatar: "https://cdn.intra.42.fr/users/0deac2fad263069699a587baaf629266/jim.JPG",
				email: "email",
				level: 0,
				win: 0,
				lose: 0,
				two_factor: false,
				user_status: 0,
			}, // temp OAuth되면 user단에서 만든 함수 이용해서  userinfo를 가져올 예정
		},
		{
			_authority: 2,
			_is_muted: false,
			_user_id: "kyoulee",
			_user_info: {
				id: "kyoulee",
				nickname: "nickname",
				avatar: "https://cdn.intra.42.fr/users/0deac2fad263069699a587baaf629266/jim.JPG",
				email: "email",
				level: 0,
				win: 0,
				lose: 0,
				two_factor: false,
				user_status: 0,
			}, // temp OAuth되면 user단에서 만든 함수 이용해서  userinfo를 가져올 예정
		},
		{
			_authority: 3,
			_is_muted: false,
			_user_id: "yolee",
			_user_info: {
				id: "yolee",
				nickname: "nickname",
				avatar: "https://cdn.intra.42.fr/users/0deac2fad263069699a587baaf629266/jim.JPG",
				email: "email",
				level: 0,
				win: 0,
				lose: 0,
				two_factor: false,
				user_status: 0,
			}, // temp OAuth되면 user단에서 만든 함수 이용해서  userinfo를 가져올 예정
		},
	];

  // export let userInfo: UserDTO;
	// : ChatUserIF
	let chat_data: ChatMsgIF = {
		_msg: '',
		_user_name: '',
		_room_name: $page.params['chat_room']
	};

	function ft_chat_send_msg() {
		if (chat_data._msg.length && chat_data._msg != '\n')
			socket.emit('chat-msg-event', chat_data);
		chat_data._msg = '';
	}

	function ft_chat_send_msg_keydown(e: KeyboardEvent) {
		if (e.keyCode != 13) return;
		ft_chat_send_msg();
	}

	function ft_exit_chat_room() {
		socket.emit('chat-exit-room', chat_data);
		goto('/main');
	}

	function ft_error_goback() {
		goto('/main');
	}

	// ------------------

	/*
	let messageFeed = [
		{
			id: 0,
			host: true,
			avatar: 48,
			name: 'Jane',
			timestamp: 'Yesterday @ 2:30pm',
			message: 'Some message text.',
			color: 'variant-soft-primary'
		},
		{
			host: false,
			avatar: 14,
			name: 'Michael',
			timestamp: 'Yesterday @ 2:45pm',
			message: 'Some message text.',
			color: 'variant-soft-primary'
		}
	];

	let elemChat: HTMLElement;

	function scrollChatBottom(behavior?: ScrollBehavior): void {
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
	}

	function addMessage(): void {
		const newMessage = {
			id: messageFeed.length,
			host: true,
			avatar: 48,
			name: 'Jane',
			timestamp: new Date(),
			message: chat_data._msg,
			color: 'variant-soft-primary'
		};
		// Append the new message to the message feed
		messageFeed = [...messageFeed, newMessage];
		// Clear the textarea message
		chat_data._msg = '';
		// Smoothly scroll to the bottom of the feed
		setTimeout(() => { scrollChatBottom('smooth'); }, 0);
	}

	let tabSet: number = 0;
 */
</script>

<!-- <section class="w-full max-h-[400px] p-4 overflow-y-auto space-y-4">
	{#each messageFeed as bubble, i}
		{#if bubble.host === true}
			<pre>host: {JSON.stringify(bubble, null, 2)}</pre>
		{:else}
			<pre>guest: {JSON.stringify(bubble, null, 2)}</pre>
		{/if}
	{/each}
</section> -->

<div class="w-full h-full grid grid-cols-[auto_1fr] gap-1" style="height: calc(90% - 64px)">
	<div class="bg-surface-500/30 p-10">
		<TabGroup>
			<Tab bind:group={tabSet} name="tab1" value={0}> 채팅방 유저</Tab>
			<!-- {#if } -->
			<Tab bind:group={tabSet} name="tab2" value={1}> 거절된 유저</Tab>
			<!-- {/if} -->
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					{#each chatUserList as chatUser}
						<ChatUserList {chatUser}/>
					{/each}
					<!-- {friend} -->
					<!-- <ChatUserList friend={friend} userInfo={userInfo} />
				{:else if tabSet === 1}
					(ban list)
					{userInfo} -->
				{/if}
			</svelte:fragment>
		</TabGroup>
			
	</div>
	<div class="bg-surface-500/30 p-4">
		<!--  -->
		<div class="grid grid-cols-[auto_1fr] gap-5">
			<Avatar src="https://i.pravatar.cc/?img={"bubble.avatar"}" width="w-12" />
			<div class="card p-4 variant-soft rounded-tl-none space-y-2">
				<header class="flex justify-between items-center">
					<p class="font-bold">{"bubble.name"}</p>
					<small class="opacity-50">{"bubble.timestamp"}</small>
				</header>
				{#each msg_list as msg}
					<p class="font-bold"> {msg} </p>
				{/each}
			</div>
		</div>
	
		<div class="grid grid-cols-[1fr_auto] gap-2">
			<div class="card p-4 rounded-tr-none space-y-2 {"bubble.color"}">
				<header class="flex justify-between items-center">
					<p class="font-bold">{"bubble.name"}</p>
					<small class="opacity-50">{"bubble.timestamp"}</small>
				</header>
				{#each msg_list as msg}
					<p class="font-bold"> {msg} </p>
				{/each}
			</div>
			<Avatar src="https://i.pravatar.cc/?img={"bubble.avatar"}" width="w-12" />
		</div>
	
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
</div>

<!-- <div bind:this={elemChat} class="overflow-y-auto">(chat)</div> -->
