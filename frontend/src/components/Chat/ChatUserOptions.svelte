<script lang="ts">
	import type { ChatActionDTO, ChatUserIF } from '$lib/interface';
	import { modalStore } from '@skeletonlabs/skeleton';
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import type { Unsubscriber } from 'svelte/store';
	import { gameSocketStore } from '$lib/webSocketConnection_game';
	import { onDestroy } from 'svelte';
	import { Authority } from '$lib/enum';
	import ChatRoomProfile from './ChatRoomProfile.svelte';

	export let chatUser: ChatUserIF;
	export let user_self: ChatUserIF;
	export let channel_name: string;

	$: chatUser;

	let chat_socket: Socket;
	let game_socket: Socket;
	// let optionButtonElement: HTMLButtonElement;
	let optionButtonElements: Array<HTMLButtonElement | null> = [null, null, null, null, null]; // Initialize the array with null values

	// $: optionButtonElement;

	const chatUnsubscribe: Unsubscriber = socketStore.subscribe((_socket: Socket) => {
		chat_socket = _socket;
	});

	const gameUnsubscribe: Unsubscriber = gameSocketStore.subscribe((_socket: Socket) => {
		game_socket = _socket;
	});

	onDestroy(() => {
		console.log("onDestroy() in ChatUserOptions.svelte");
		chatUnsubscribe();
		gameUnsubscribe();
	});

	function ft_invite_user(action: string) {
		game_socket.emit("sendGameInvite", chatUser._user_info.id);
	}

	function ft_mute_user(action: string) {
		let send: ChatActionDTO = {
			_action: action,
			_channel_name: channel_name,
			_user_from: user_self._user_info.id,
			_user_to: chatUser._user_info.id
		};
		chat_socket.emit('chat-mute-user', send);
	}
	function ft_kick_user(action: string) {
		let send: ChatActionDTO = {
			_action: action,
			_channel_name: channel_name,
			_user_from: user_self._user_info.id,
			_user_to: chatUser._user_info.id
		};
		chat_socket.emit('chat-kick-user', send);
	}
	function ft_ban_user(action: string) {
		let send: ChatActionDTO = {
			_action: action,
			_channel_name: channel_name,
			_user_from: user_self._user_info.id,
			_user_to: chatUser._user_info.id
		};
		chat_socket.emit('chat-ban-user', send);
	}
	function ft_appoint_user(action: string) {
		let send: ChatActionDTO = {
			_action: action,
			_channel_name: channel_name,
			_user_from: user_self._user_info.id,
			_user_to: chatUser._user_info.id
		};
		chat_socket.emit('chat-auth-user', send);
	}

    function ft_profile_view_in_chatroom(user_info :UserDTO) {

        const modalComponent: ModalComponent = {
            ref: ChatRoomProfile,
			props: {profile_info: user_info},
        };

        const modal: ModalSettings = {
            type: 'component',
            component: modalComponent,
        };
        modalStore.trigger(modal);
    }
</script>

<div class="card p-2 z-10 column-count-1" data-popup={chatUser._user_info.id}>
	<div class="hover:variant-filled-surface">
		<button
			class="cursor-pointer"
			bind:this={optionButtonElements[0]}
			on:click={() => {
					optionButtonElements[0]?.blur();
					ft_profile_view_in_chatroom(chatUser._user_info);
				}
			}
		>
			개인정보
		</button>
	</div>

	{#if chatUser._user_info.id !== user_self._user_info.id}
		<div class="hover:variant-filled-surface">
			<button
				class="cursor-pointer"
				bind:this={optionButtonElements[1]}
				on:click={() => {
					optionButtonElements[1]?.blur();
					ft_invite_user('invite');
				}}>놀이 초대</button
			>
		</div>
		{#if user_self._authority < chatUser._authority}
			{#if !chatUser._is_muted}
				<div class="hover:variant-filled-surface">
					<button
						class="cursor-pointer"
						bind:this={optionButtonElements[2]}
						on:click={() => {
							optionButtonElements[2]?.blur();
							ft_mute_user('mute');
						}}>멈춰✋</button
					>
				</div>
			{/if}
			<div class="hover:variant-filled-surface">
				<button
					class="cursor-pointer"
					bind:this={optionButtonElements[3]}
					on:click={() => {
						optionButtonElements[3]?.blur();
						ft_kick_user('kick');
					}}>내보내기</button
				>
			</div>
			<div class="hover:variant-filled-surface">
				<button
					class="cursor-pointer"
					bind:this={optionButtonElements[4]}
					on:click={() => {
						optionButtonElements[4]?.blur();
						ft_ban_user('ban');
					}}>영구추방</button
				>
			</div>
		{/if}
		{#if user_self._authority === Authority.OWNER}
			{#if chatUser._authority == Authority.USER}
				<div class="hover:variant-filled-surface">
					<button
						class="cursor-pointer"
						on:click={() => {
							ft_appoint_user('appoint');
						}}>부방장 임명</button
					>
				</div>
			{:else}
				<div class="hover:variant-filled-surface">
					<button
						class="cursor-pointer"
						on:click={() => {
							ft_appoint_user('unappoint');
						}}>부방장 해고</button
					>
				</div>
			{/if}
		{/if}
	{/if}
</div>
