<script lang="ts">
	import '../../../service/userDTO'
	import { Avatar, Tab, TabGroup } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { ChatAuthDTO, ChatMsgIF, ChatRoomSendIF, ChatUserIF, RoomCheckIF } from '$lib/interface';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import ChatUserList from '../../../components/Chat/ChatUserList.svelte';
	import type { Unsubscriber } from 'svelte/store';
	import { Authority } from '$lib/enum';
	import { gameSocketStore } from '$lib/webSocketConnection_game';
	import { gameClientOption, type GameInvitationData } from '$lib/gameData';

	import { Toast, toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	let toastID: string = '';

	function errorToast(msg: string): void {
			const t: ToastSettings = {
					message: msg,
					hideDismiss: true,
					timeout: 3000
			};
			toastStore.trigger(t);
	}

	function confirmToast(msg: string, data: GameInvitationData) {
			const t: ToastSettings = {
					message: msg,
					action: {
						label: '수락',
						response: () => {
							data.acceptFlag = true;
							socket_game.emit("inviteResponse", data);
						},
					},
					autohide: false,
					callback: (response) => {
						toastID = response.id;
						if (response.status === 'closed') {
							socket_game.emit("inviteResponse", data);
						}
					}
			};
			toastStore.trigger(t);
	}


	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	let socket: Socket;
	let socket_game: Socket;
	let user_self: ChatUserIF;
	let channel_name: string = $page.params['chat_room'];
	let room : ChatRoomSendIF;
	let msg_list: ChatMsgIF[] = [];
	let chat_data: ChatMsgIF = {
		_msg: '',
		_user_name: '',
		_user_avatar: '',
		_room_name: $page.params['chat_room']
	};
	let tabSet: number = 0;
	let invite_status: boolean = false;

	const unsubscribe : Unsubscriber = socketStore.subscribe((_socket: Socket) => {
		socket = _socket;
	});

	const unsubscribe_game : Unsubscriber = gameSocketStore.subscribe((_socket: Socket) => {
		socket_game = _socket;
	});

	const gameQuit = async() => {
		socket_game.emit('gameQuit');
		await goto('/main');
	}

	onMount(async () => {
		try {
			if (socket === undefined) {
				await goto("/main");
			}
			/* ===== chat-connect ===== */
			chat_data._room_name = $page.params['chat_room'];

			socket.emit('chat-connect', { _room: $page.params['chat_room'], _check: true });
			socket.on('chat-connect', (data: RoomCheckIF) => {
				if (!data._check) {
					goto("/main");
				}
				user_self = data._user;
				socket.emit("chat-refresh", $page.params['chat_room']);
			});

			socket.on("chat-self-update", (data: ChatUserIF)=>{
				user_self = data;
			})


			/* ===== chat-refresh ===== */
			socket.on('chat-refresh', (data: ChatRoomSendIF | string) => {
				if (typeof data === 'object')
					room = data;
				else
				{
					goto("/main");
				}
			})

			socket.on("chat-leave", (data) => {
				goto("/main");
			})

			/* ===== chat-msg-even ===== */
			socket.on('chat-msg-event', (data: ChatMsgIF) => {
				msg_list = [...msg_list, data];
				setTimeout(() => {
					scrollChatBottom('smooth');
				}, 0);
			});
			/* ===== chat-set-admin ===== */
			socket.on('chat-set-admin', (data: ChatAuthDTO) => {
				if (!data._check)
					return errorToast('권한 설정에 실패했습니다'); //권한 설정 실패
				/// 권한 변경
			});

			/* ===== game-invite ===== */
			socket_game.on('youGotInvite', handleGameInvite);

			async function handleGameInvite(data: string) {
				let send_data : GameInvitationData = { acceptFlag: false, opponentPlayer: data};
				confirmToast('&nbsp&nbsp&nbsp&nbsp&nbsp게임초대&nbsp&nbsp&nbsp&nbsp&nbsp', send_data);
			}

			socket_game.on('opPlayerExit', () => {
				toastStore.close(toastID);
			});

			socket_game.on("roomName", (data: string) => {
				gameClientOption._roomName = data;
				goto('/game/option');
			})
		}
		catch (error) {
			goto('/main');
		}
	});

	onDestroy(() => {
		toastStore.close(toastID);
		unsubscribe();
		unsubscribe_game();
		if (socket !== undefined)
		{
			socket.off('chat-connect');
			socket.off('chat-refresh');
			socket.off('chat-msg-event');
			socket.off('chat-set-admin');
			socket.off('chat-self-update');
			socket.off('chat-leave');
			socket_game.off('youGotInvite');
			socket_game.off('roomName');
			socket.emit('chat-exit-room', chat_data);
			socket_game.emit('exitChatRoom');
		}
	});

	/* ================================================================================
									chat msg
	   ================================================================================ */

	function ft_chat_send_msg() {
		chat_data._msg = chat_data._msg.trim()
        if (!(chat_data._msg))
            return
        else if (chat_data._msg.length >= 300)
            return errorToast('300자 이내로 입력해주세요');
		if (chat_data._msg.length && chat_data._msg != '\n')
			socket.emit('chat-msg-event', chat_data);
		chat_data._msg = '';
	}

	function ft_chat_send_msg_keydown(e: KeyboardEvent) {
		if (e.keyCode != 13) return;
		ft_chat_send_msg();
	}

	let elemChat: HTMLElement;

	function scrollChatBottom(behavior?: ScrollBehavior): void {
		if (elemChat && elemChat.scrollHeight && elemChat.scrollHeight > window.innerHeight)
			elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
	}

	const main = async () => {
		await goto('/main')
	}

</script>

<svelte:window on:popstate={main}/>
{#if room !== undefined}
<div class="w-full h-full grid grid-cols-[auto_1fr] gap-1" style="height: calc(90% - 64px)">
	<div class="bg-surface-500/30 p-10">
		<TabGroup>
			<Tab bind:group={tabSet} name="tab1" value={0}> 채팅방 유저</Tab>
			{#if user_self._authority === Authority.OWNER
				|| user_self._authority === Authority.ADMIN}
				<Tab bind:group={tabSet} name="tab2" value={1}> 거절된 유저</Tab>
			{/if}
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					{#each [... room._users] as [userid_list, chatUser]}
						<ChatUserList
							bind:user_self={user_self}
							bind:userid_list={userid_list}
							bind:chatUser={chatUser}
							bind:channel_name={channel_name}
						/>
					{/each}
				{/if}
				{#if tabSet === 1}
					<div>
						{#each room._ban_user as ban_user}
							<div> {ban_user} </div>
						{/each}
					</div>
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
	<div bind:this={elemChat} class="max-h-[700px] p-4 overflow-y-auto space-y-4">
		{#each msg_list as msg}
			{#if (msg._user_name == user_self._user_info.id)}
				<div class="grid grid-cols-[auto_1fr] gap-5">
					<Avatar src="{msg._user_avatar}" width="w-12" />
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
						</header>
						<p class="font-bold">{msg._msg}</p>
					</div>
					<Avatar src="{msg._user_avatar}" width="w-12" />
				</div>
			{/if}
		{/each}

		<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
			<button class="input-group-shim"></button>
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
{/if}
<Toast max={5} buttonDismiss={'btn variant-filled'} buttonDismissLabel={'거절'} />
