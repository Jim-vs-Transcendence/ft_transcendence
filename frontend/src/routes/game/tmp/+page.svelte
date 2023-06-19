<script lang="ts">
	// import Canvas from './Canvas.svelte'

	import { onMount, afterUpdate } from 'svelte';

	// export let width = 900;
	// export let height = 400;

	// let canvas: HTMLCanvasElement;
	// let ctx: CanvasRenderingContext2D;

	// onMount(() => {
	// 	ctx = canvas.getContext('2d');
	// 	canvas.style.backgroundColor = 'red';
	// });

	export let width: any = 1200;
	export let height: any = 600;
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	function resizeCanvas() {
		if (window.innerWidth <= 1200 || window.innerHeight <= 600)
		{
			alert('👆👆👆👆👆👆 멈춰 👆👆👆👆👆👆👆👆👆');
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		canvas.style.backgroundColor = 'red';

		window.addEventListener('resize', resizeCanvas);
	});

	afterUpdate(() => {
		// resizeCanvas();

	});

</script>

<div class="canvas-container">
	<div class="canvas-wrapper">
		<canvas bind:this={canvas} {width} {height} />
	
	</div>
</div>
<div class="button-container">
		<button
			class="skeleton-button variant-glass-secondary btn-lg rounded-lg transition-transform duration-200 ease-in-out hover:scale-110"
			data-sveltekit-preload-data="hover"
		>
			retry
		</button>

		<button
			class="skeleton-button variant-glass-secondary btn-lg rounded-lg transition-transform duration-200 ease-in-out hover:scale-110"
			data-sveltekit-preload-data="hover"
		>
			retry
		</button>
</div>


	
<style>
	.button-container {
		display: flex;
		justify-content: center;
		align-content: center;
		gap: 10rem;
	}

	.canvas-container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh; /* 화면 높이에 맞게 캔버스 컨테이너의 높이를 설정 */
	}

	.canvas-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
