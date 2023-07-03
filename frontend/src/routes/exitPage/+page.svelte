<script lang="ts">
	import { goto } from "$app/navigation";
	import { CreateSocket, socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from "socket.io-client";
	import { onDestroy } from "svelte";

	let socket: Socket;
	let emptySocket: Socket;

	const unsubscribe = socketStore.subscribe((_socket: Socket) => {
		socket = _socket;
	});

	async function gotoMain()
	{
		socketStore.set(emptySocket);
		goto("/");
	}

	onDestroy(() => {
		unsubscribe();
	});
</script>

<p>소켓 연결이 끊어졌습니다.</p> 
<button on:click={gotoMain}>재로그인</button>