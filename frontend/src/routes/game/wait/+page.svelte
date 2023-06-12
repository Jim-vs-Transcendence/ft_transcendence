<script lang="ts">
	import { onMount } from 'svelte';
	import { afterUpdate } from 'svelte';
	import { onDestroy } from 'svelte';

	import { goto } from '$app/navigation';
	import { io_game } from '$lib/webSocketConnection_game';

	import { gameRoom } from '$lib/gameData';


	const main = async () => {
		await goto('/main');
	}

	const url = new URL('http://localhost:5173/game/inGame');


	function navigateTo(path : URL) {
		window.history.pushState({}, "", path);
		window.dispatchEvent(new PopStateEvent("popstate"));
		}


	// onMount(() => {
		io_game.on('handShaking', (flag: boolean) => {
			if (flag) {
				io_game.emit('handShaking', true);
			}
		});
		
		console.log(io_game.id);
		io_game.on('roomName', (roomName: string) => {
			gameRoom._roomName = roomName;
			console.log('got message from : ', roomName);
			goto('../inGame', { state: io_game });
	})

</script>


<div class="container h-full mx-auto flex justify-center items-center">
    <div class="space-y-5">
      <button class="skeleton-button variant-glass-secondary btn-lg rounded-lg transition-transform duration-200 ease-in-out hover:scale-110" data-sveltekit-preload-data="hover" on:click={main}>게임 포기</button>
    </div>
</div>