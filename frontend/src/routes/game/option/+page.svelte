<script lang="ts">
	import { io_game } from '$lib/webSocketConnection_game';


</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<button class="skeleton-button variant-glass-secondary btn-lg rounded-lg transition-transform duration-200 ease-in-out hover:scale-110" data-sveltekit-preload-data="hover" on:click={match}>게임 시작</button>
	</div>
</div>