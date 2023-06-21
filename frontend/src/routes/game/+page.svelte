<script lang="ts">
	import { onMount } from 'svelte';
	import { afterUpdate } from 'svelte';
	import { onDestroy } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { gameSocketStore } from '$lib/webSocketConnection_game';
	import { goto } from '$app/navigation';
	import { gameClientOption } from '$lib/gameData';


	let io_game: Socket;

	let src = '$lib/tmp.png'

	const unsubscribeGame = gameSocketStore.subscribe((_gameSocket: Socket) => {
		io_game = _gameSocket;
	})

	const main = async () => {
		io_game.emit('queueOut', );
		await goto('/main');
	};

	onMount(() => {
		if (io_game === undefined) {
			goto('/main');
		}

		io_game.emit('pushMatchList', );

		io_game.on('roomName', (roomName: string) => {
			gameClientOption._roomName = roomName;
			console.log('got message from : ', roomName);
			goto('/game/option');
		});
	})

	onDestroy(unsubscribeGame);

</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<!-- <button
			class="skeleton-button variant-glass-secondary btn-lg rounded-lg transition-transform duration-200 ease-in-out hover:scale-110"
			data-sveltekit-preload-data="hover"
			on:click={main}>게임 포기</button
		> -->
		<img src="lib/tmp.png" alt="tmp"/>
	</div>
</div>
