<script lang="ts">
	import { goto } from '$app/navigation';
	import { io_chat } from '$lib/webSocketConnection_chat';
	import { each } from 'svelte/internal';

	export let data: PayLoadIF; // extern

	let chat_data: ChatMsgIF = {
		_msg: '',
		_room_info: {
			_room_name: '',
			_room_password: ''
		}
	};
	let msg_list: string[] = [];

	function ft_error_goback() {
		goto('/chat');
	}

	io_chat.on('chat-connect', (data: PayLoadIF) => {
		if (!data._check) console.log('PayLoad false');
		chat_data._room_info._room_name = data._url;
		// or popup 잘못된 접근입니다 확인 => goto (/chat);
	});

	io_chat.on('chat-msg-event', (data: ChatMsgIF) => {
		console.log('chat-msg-event', data._msg);
		msg_list = [...msg_list, data._msg];
	});

	io_chat.emit('chat-connect', data);

	function ft_chat_send_msg() {
		if (chat_data._msg) io_chat.emit('chat-msg-event', chat_data);
		chat_data._msg = '';
	}

	function ft_chat_send_msg_keydown(e: KeyboardEvent) {
		if (e.keyCode != 13) return;
		ft_chat_send_msg();
	}

	function ft_exit_chat_room() {
		io_chat.emit('chat-exit-room', chat_data);
		goto('/chat');
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
