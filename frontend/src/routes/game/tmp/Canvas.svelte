<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';

	export let width = 200;
	export let height = 400;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	onMount(() => {
		ctx = canvas.getContext('2d');
	});

	afterUpdate(() => {
	if (canvas) {
		canvas.style.backgroundColor = 'red';
	}
	});
</script>

<!-- <canvas bind:this={canvas} {width} {height} style="position: absolute; top: 0; " /> -->
<canvas bind:this={canvas} {width} {height} />
