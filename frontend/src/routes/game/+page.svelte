<script lang="ts">
	import { onMount } from 'svelte';
	import { afterUpdate } from 'svelte';
	import { onDestroy } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { CreateGameSocket, gameSocketStore } from '$lib/webSocketConnection_game';
	import { goto } from '$app/navigation';
	import { gameClientOption } from '$lib/gameData';


	let io_game: Socket;

	const unsubscribe = gameSocketStore.subscribe((_socket: Socket) => {
		io_game = _socket;
	});

	const main = async () => {
		await goto('/main');
	};

	onMount(() => {
		io_game.emit('pushMatchList', );

		io_game.on('roomName', (roomName: string) => {
			gameClientOption._roomName = roomName;
			console.log('got message from : ', roomName);
			goto('/game/option');
		});
	})

	onDestroy(unsubscribe);

</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<button
			class="skeleton-button variant-glass-secondary btn-lg rounded-lg transition-transform duration-200 ease-in-out hover:scale-110"
			data-sveltekit-preload-data="hover"
			on:click={main}>게임 포기</button
		>
	</div>
</div>
