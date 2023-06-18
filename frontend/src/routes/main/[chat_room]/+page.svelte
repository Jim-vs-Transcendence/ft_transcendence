<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { io_chat } from '$lib/webSocketConnection_chat';
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';
	import { each } from 'svelte/internal';
	import ChatUserList from '../../../components/Chat/ChatUserList.svelte'
	// import '$lib/interface.d'
	import type { PayLoadIF, ChatUserIF } from '$lib/interface.d'

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
		_room_info: {
			_room_name: '',
			_room_password: '',
			_participant_list: [],
    		_banned_list: []
			// _participant_list: 
			// 소켓 통신을 위해 있다
			// Data를 주고 받기 위한 구조체이다
			// 따로 구조체를 만들어서 써야한다.
		}
	};


	let msg_list: string[] = [];

	function ft_error_goback() {
		goto('/main');
	}

	io_chat.on('chat-connect', (data: PayLoadIF) => {
		if (!data._check) console.log('PayLoad false');
		chat_data._room_info._room_name = data._url;
		// or popup 잘못된 접근입니다 확인 => goto (/main);
	});

	io_chat.on('chat-msg-event', (data: ChatMsgIF) => {
		console.log('chat-msg-event', data._msg);
		msg_list = [...msg_list, data._msg];
	});

	io_chat.emit('chat-connect', data);

	function ft_chat_send_msg() {
		// if (chat_data._msg) io_chat.emit('chat-msg-event', chat_data);
		msg_list = [... msg_list, chat_data._msg]
		chat_data._msg = '';
	}

	function ft_chat_send_msg_keydown(e: KeyboardEvent) {
		if (e.keyCode != 13) return;
		ft_chat_send_msg();
	}

	function ft_exit_chat_room() {
		io_chat.emit('chat-exit-room', chat_data);
		goto('/main');
	}

	// ------------------

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
				on:keydown={ft_chat_send_msg_keydown}
				class="bg-transparent border-0 ring-0"
				name="prompt"
				id="prompt"
				placeholder="Write a message..."
				rows="1"
			/>
			<button class="variant-filled-primary text_input_btn" on:click={ft_chat_send_msg}>Send</button>
		</div>
		<!--  -->
	</div>
</div>
					
<!-- <div bind:this={elemChat} class="overflow-y-auto">(chat)</div> -->
