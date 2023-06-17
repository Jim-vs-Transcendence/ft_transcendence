<script lang="ts">
	import { goto } from '$app/navigation';
	import { socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';

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
			msg_list = [...msg_list, data._msg];
		});

		/* ===== chat-msg-even ===== */

	});

	onDestroy(unsubscribe);

	/* ================================================================================
									chat msg
	   ================================================================================ */

	let msg_list: string[] = [];

	let chat_data: ChatMsgIF = {
		_msg: '',
		_room_name: $page.params['chat_room']
	};

	function ft_chat_send_msg() {
		if (chat_data._msg) socket.emit('chat-msg-event', chat_data);
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
</script>

<div>here is chatroom</div>
<div>
	<lu>
		{#each msg_list as msg}
			<li>{msg}</li>
		{/each}
	</lu>
	<input type="text" bind:value={chat_data._msg} />
	<button on:keydown={ft_chat_send_msg_keydown} on:click={ft_chat_send_msg}>send</button>
</div>
<button on:mousedown={ft_exit_chat_room}> go back </button>
