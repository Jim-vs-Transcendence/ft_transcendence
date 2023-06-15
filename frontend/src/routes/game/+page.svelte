<script lang="ts">
	import { onMount } from 'svelte';
	import { afterUpdate } from 'svelte';
	import { onDestroy } from 'svelte';

	import { goto } from '$app/navigation';
	import { io_game } from '$lib/webSocketConnection_game';

	import { gameRoom } from '$lib/gameData';

	const main = async () => {
		await goto('/main');
	};

	onMount(() => {

		io_game.emit('waitListInit', (userId: string));

		io_game.on('roomName', (roomName: string) => {
			gameRoom._roomName = roomName;
			console.log('got message from : ', roomName);
			goto('/game/option');
		});
	})


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
