<script lang="ts">
	import '../../../service/userDTO';
	import { Avatar, Tab, TabGroup, type ModalComponent, type ModalSettings, modalStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import type {
	ChatActionDTO,
		ChatAuthDTO,
		ChatMsgIF,
		ChatRoomIF,
		ChatRoomSendIF,
		ChatUserIF,
		RoomCheckIF
	} from '$lib/interface';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import ChatUserList from '../../../components/Chat/ChatUserList.svelte';
	import type { Unsubscriber } from 'svelte/store';
	import { Authority } from '$lib/enum';
	import { gameSocketStore } from '$lib/webSocketConnection_game';
	import { gameClientOption, type GameInvitationData } from '$lib/gameData';
	import ChatRoomProfile from '../../../components/Chat/ChatRoomProfile.svelte';

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	let socket: Socket;
	let socket_game: Socket;
	let user_self: ChatUserIF;
	let channel_name: string = $page.params['chat_room'];
	let room: ChatRoomSendIF;
	let msg_list: ChatMsgIF[] = [];
	let chat_data: ChatMsgIF = {
		_msg: '',
		_user_name: '',
		_user_avatar: '',
		_room_name: $page.params['chat_room']
	};
	let tabSet: number = 0;
	let chatUserList: Map<string, UserDTO>;
	let invite_status: boolean = false;

	const unsubscribe: Unsubscriber = socketStore.subscribe((_socket: Socket) => {
		socket = _socket;
	});

	const unsubscribe_game: Unsubscriber = gameSocketStore.subscribe((_socket: Socket) => {
		socket_game = _socket;
	});

	onMount(async () => {
		try {
			if (socket === undefined) await goto('/main');
			/* ===== chat-connect ===== */
			chat_data._room_name = $page.params['chat_room'];

			socket.emit('chat-connect', { _room: $page.params['chat_room'], _check: true });

			await socket.on('chat-connect', (data: RoomCheckIF) => {
				if (!data._check) {
					alert('잘못된 접근입니다');
					goto('/main');
				} else user_self = data._user;
			});
			socket.emit('chat-refresh', $page.params['chat_room']);

			socket.on('chat-self-update', (data: ChatUserIF) => {
				user_self = data;
			});
			/* ===== chat-refresh ===== */
			socket.on('chat-refresh', (data: ChatRoomSendIF | string) => {
				console.log(data);
				if (typeof data === 'object') room = data;
				else {
					console.log('chat refresh error');
					goto('/main');
				}
			});

			socket.on('chat-leave', (data) => {
				console.log('chat_leave', data);
				goto('/main');
			});

			/* ===== chat-msg-even ===== */
			socket.on('chat-msg-event', (data: ChatMsgIF) => {
				console.log('chat-msg-event : ', data);
				msg_list = [...msg_list, data];
				setTimeout(() => {
					scrollChatBottom('smooth');
				}, 0);
			});
			/* ===== chat-set-admin ===== */
			socket.on('chat-set-admin', (data: ChatAuthDTO) => {
				if (!data._check) return alert('권한 설정 실패');
				/// 권한 변경
			});

			/* ===== game-invite ===== */
			socket_game.on('youGotInvite', handleGameInvite);

			function handleGameInvite(data: string) {
				console.log('초대좀 받아라');
				let send_data: GameInvitationData = { acceptFlag: false, opponentPlayer: data };
				if (!invite_status) {
					invite_status = true;
					if (confirm('게임초대')) {
						console.log('게임초대 수락');
						send_data.acceptFlag = true;
					} else {
						console.log('게임초대 거절');
						invite_status = false;
					}
					socket_game.emit('inviteResponsse', send_data);
				}
			}

			socket_game.on('roomName', (data: string) => {
				gameClientOption._roomName = data;
				goto('/game/option');
			});
		} catch {
			console.log('error');
		}
	});

	onDestroy(() => {
		unsubscribe();
		if (socket !== undefined) {
			socket.off('chat-connect');
			socket.off('chat-refresh');
			socket.off('chat-msg-event');
			socket.off('chat-set-admin');
			socket.off('chat-self-update');
			socket.off('chat-leave');
			socket_game.off('youGotInvite');
			socket_game.off('roomName');
			socket.emit('chat-exit-room', chat_data);
		}
	});

	/* ================================================================================
									chat msg
	   ================================================================================ */

	function ft_chat_send_msg() {
		if (chat_data._msg.length && chat_data._msg != '\n') socket.emit('chat-msg-event', chat_data);
		chat_data._msg = '';
		console.log(user_self);
	}

	function ft_chat_send_msg_keydown(e: KeyboardEvent) {
		if (e.keyCode != 13) return;
		ft_chat_send_msg();
	}

	let elemChat: HTMLElement;

	function scrollChatBottom(behavior?: ScrollBehavior): void {
		elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
	}

	/* ================================================================================
									chat option
	   ================================================================================ */

	function ft_invite_user(chatUser :ChatUserIF, action: string) {
		console.log(action);
		console.log(chatUser._user_info);
		socket_game.emit('sendGameInvite', chatUser._user_info.id);
	}

	function ft_mute_user(chatUser :ChatUserIF, action: string) {
		console.log(action);
		let send: ChatActionDTO = {
			_action: action,
			_channel_name: channel_name,
			_user_from: user_self._user_info.id,
			_user_to: chatUser._user_info.id
		};
		socket.emit('chat-mute-user', send);
	}
	function ft_kick_user(chatUser :ChatUserIF, action: string) {
		console.log(action);
		let send: ChatActionDTO = {
			_action: action,
			_channel_name: channel_name,
			_user_from: user_self._user_info.id,
			_user_to: chatUser._user_info.id
		};
		socket.emit('chat-kick-user', send);
	}
	function ft_ban_user(chatUser :ChatUserIF, action: string) {
		console.log(action);
		let send: ChatActionDTO = {
			_action: action,
			_channel_name: channel_name,
			_user_from: user_self._user_info.id,
			_user_to: chatUser._user_info.id
		};
		socket.emit('chat-ban-user', send);
	}
	function ft_appoint_user(chatUser :ChatUserIF, action: string) {
		console.log(action);
		let send: ChatActionDTO = {
			_action: action,
			_channel_name: channel_name,
			_user_from: user_self._user_info.id,
			_user_to: chatUser._user_info.id
		};
		socket.emit('chat-auth-user', send);
	}

	function ft_profile_view_in_chatroom(chatUser :ChatUserIF, user_info: UserDTO) {
		const modalComponent: ModalComponent = {
			ref: ChatRoomProfile,
			props: { profile_info: user_info }
		};

		const modal: ModalSettings = {
			type: 'component',
			component: modalComponent
		};
		modalStore.trigger(modal);
	}
</script>

<!-- <svelte:window on:popstate={() => goto('/main')} /> -->
{#if room !== undefined}
	<div class="w-full h-full grid grid-cols-[auto_1fr] gap-1" style="height: calc(90% - 64px)">
		<div class="bg-surface-500/30 p-10">
			<!-- <TabGroup> -->
				<!-- <Tab bind:group={tabSet} name="tab1" value={0}>채팅방 유저</Tab>
				{#if user_self._authority === Authority.OWNER || user_self._authority === Authority.ADMIN}
					<Tab bind:group={tabSet} name="tab2" value={1}>거절된 유저</Tab>
				{/if} -->
				<!-- <svelte:fragment slot="panel"> -->
					{#if tabSet === 0}
						{#each room._users as [user_name, chatUser]}
							<dl class="list-dl">
								<li>
									<span />
									<span class="flex-auto" />
								</li>
								<div class="cursor-pointer">
									<div class="flex-auto">
										<span>
											<Avatar src={chatUser._user_info.avatar} width="w-7" rounded="rounded-full" />
											{user_name} | {chatUser._user_info.nickname}
										</span>
										{#if chatUser._authority === Authority.OWNER}
											<span class="badge p-0">👑</span>
										{:else if chatUser._authority === Authority.ADMIN}
											<span class="badge p-0">🗡️</span>
										{/if}
										{#if chatUser._is_muted}
											<span class="badge p-0">🔇</span>
										{/if}
									</div>
								</div>
								<div class="card p-2 z-10 column-count-1">
									<div class="hover:variant-filled-surface">
										<button class="cursor-pointer" on:click={() => {ft_profile_view_in_chatroom(chatUser, chatUser._user_info)}}>
											개인정보
										</button>
									</div>
									{#if chatUser._user_info.id !== user_self._user_info.id}
										<div class="hover:variant-filled-surface">
											<button class="cursor-pointer" on:click={()=>{ft_invite_user(chatUser, 'invite');}}> 놀이 초대 </button>
										</div>
										{#if user_self._authority < chatUser._authority}
											{#if !chatUser._is_muted}
												<div class="hover:variant-filled-surface">
													<button class="cursor-pointer" on:click={() => { ft_mute_user(chatUser, 'mute');}}>멈춰✋</button>
												</div>
											{/if}
											<div class="hover:variant-filled-surface">
												<button class="cursor-pointer" on:click={() => { ft_kick_user(chatUser, 'kick'); }}>내보내기</button>
											</div>
											<div class="hover:variant-filled-surface">
												<button class="cursor-pointer" on:click={() => { ft_ban_user(chatUser, 'ban');}}>영구추방</button>
											</div>
										{/if}
										{#if user_self._authority === Authority.OWNER}
											{#if chatUser._authority == Authority.USER}
												<div class="hover:variant-filled-surface">
													<button class="cursor-pointer" on:click={() => { ft_appoint_user(chatUser, 'appoint'); }}>부방장 임명</button>
												</div>
											{:else}
												<div class="hover:variant-filled-surface">
													<button class="cursor-pointer" on:click={() => { ft_appoint_user(chatUser, 'unappoint'); }}>부방장 해고</button>
												</div>
											{/if}
										{/if}
									{/if}
								</div>
							</dl>
							
						{/each}
					{/if}
					{#if tabSet === 1}
						<div>
							{#each room._ban_user as ban_user}
								<div>{ban_user}</div>
							{/each}
						</div>
					{/if}
				<!-- </svelte:fragment> -->
			<!-- </TabGroup> -->
		</div>
		<div bind:this={elemChat} class="max-h-[700px] p-4 overflow-y-auto space-y-4">
			{#each msg_list as msg}
				{#if msg._user_name == user_self._user_info.id}
					<div class="grid grid-cols-[auto_1fr] gap-5">
						<Avatar src={msg._user_avatar} width="w-12" />
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
								<p class="font-bold">{msg._user_name}</p>
							</header>
							<p class="font-bold">{msg._msg}</p>
						</div>
						<Avatar src={msg._user_avatar} width="w-12" />
					</div>
				{/if}
			{/each}

			<div
				class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token"
			>
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
				<button class="variant-filled-primary text_input_btn" on:click={ft_chat_send_msg}
					>Send</button
				>
			</div>
		</div>
	</div>
{/if}
