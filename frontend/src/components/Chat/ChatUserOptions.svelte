<script lang="ts">
  import type { ChatUserIF }  from '$lib/interface';
  import type { PopupSettings } from '@skeletonlabs/skeleton';
  import { socketStore } from '$lib/webSocketConnection_chat';
  import type { Socket } from 'socket.io-client';
  import type { Unsubscriber } from 'svelte/store';
  import { gameSocketStore } from '$lib/webSocketConnection_game';
  import { onDestroy } from 'svelte';
  // import { popup } from '@skeletonlabs/skeleton';
  // import { storePopup } from '@skeletonlabs/skeleton';

  // profile modal
  import { modalStore } from '@skeletonlabs/skeleton';
  import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';

  export let chatUser: ChatUserIF;
  $: chatUser;

	let chat_socket : Socket;
	let game_socket : Socket;

	const chatUnsubscribe : Unsubscriber = socketStore.subscribe((_socket : Socket) => {
		chat_socket = _socket;
	})
	
	const gameUnsubscribe : Unsubscriber = gameSocketStore.subscribe((_socket : Socket) => {
		game_socket = _socket;
	})
	
	function ft_show_profile(_user_id: string) {
		console.log(_user_id);
	}
	function ft_invite_user(_user_id: string) {
		console.log(_user_id);
	}
    function ft_mute_user(_user_id: string) {
        console.log(_user_id);
    }
    function ft_kick_user(_user_id: string) {
        console.log(_user_id);
    }
    function ft_ban_user(_user_id: string) {
        console.log(_user_id);
    }
    function ft_appoint_user(_user_id: string) {
        console.log(_user_id);
    }

	onDestroy(() => {
		chatUnsubscribe();
		gameUnsubscribe();
	})

    function triggerModal() {
		const modal: ModalSettings = {
			type: 'alert',
			// Data
			title: 'Example Alert',
			body: 'This is an example modal.',
			image: 'https://i.imgur.com/WOgTG96.gif',
		};
		modalStore.trigger(modal);

        // const modalComponent: ModalComponent = {
        //     ref: ChatUI,
        // };

        // const modal: ModalSettings = {
        //     type: 'component',
        //     // Data
        //     component: modalComponent
        //     // response: (r: string) => console.log('response:', r),
        // };
        // modalStore.trigger(modal);
    }

</script>

<div class="card p-2 z-10 column-count-1" data-popup={chatUser._user_info.id}>
  <!-- <div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={() => {ft_show_profile("show profile");}}> 개인정보 </button></div> -->
  <div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={triggerModal}> 개인정보 </button></div>
	<div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={() => {ft_invite_user("invite");}}>놀이 초대</button></div>
	<div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={() => {ft_mute_user("mute");}}>멈춰✋</button></div>
	<div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={() => {ft_kick_user("kick");}}>내보내기</button></div>
	<div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={() => {ft_ban_user("ban");}}>영구추방</button></div>
	<div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={() => {ft_appoint_user("appoint");}}>부방장 임명</button></div>
	<div class="arrow bg-surface-100-800-token" />
</div>