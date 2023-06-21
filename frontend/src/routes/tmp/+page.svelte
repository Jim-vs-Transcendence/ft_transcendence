<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	const WIDTH = 600;
	const HEIGHT = 400;
	const PADDLE_WIDTH = 10;
	const PADDLE_HEIGHT = 80;
	const BALL_RADIUS = 10;
	const BALL_SPEED = 5;
	const PADDLE_SPEED = 2;
  
	let ballX = WIDTH / 2;
	let ballY = HEIGHT / 2;
	let ballVX = BALL_SPEED;
	let ballVY = BALL_SPEED;
	let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
	let computerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;

	let playerScore = 0;
	let computerScore = 0;
	let gameStarted = false;

	let ctx: CanvasRenderingContext2D | null = null;
	let animationFrameId: number;
  
	let canvas: HTMLCanvasElement;

	onMount(() => {
		ctx = canvas.getContext('2d');
	});

	function startGame() {
		gameStarted = true;
		playerScore = 0;
		computerScore = 0;

		animationFrameId = requestAnimationFrame(gameLoop);
	}

	function gameLoop() {
		if (gameStarted) {
			update();
			draw();

			if (playerScore === 5 || computerScore === 5) {
				cancelAnimationFrame(animationFrameId);
				gameStarted = false;
			} else {
				animationFrameId = requestAnimationFrame(gameLoop);
			}
		}
	}

	function update() {
		ballX += ballVX;
		ballY += ballVY;

		if (ballY - BALL_RADIUS < 0 || ballY + BALL_RADIUS > HEIGHT) {
			ballVY = -ballVY;
		}

		if (ballX - BALL_RADIUS < 0) {
			computerScore += 1;
			resetBall();
		}

		if (ballX + BALL_RADIUS > WIDTH) {
			playerScore += 1;
			resetBall();
		}

		if (
			ballX - BALL_RADIUS < PADDLE_WIDTH &&
			ballY > playerY &&
			ballY < playerY + PADDLE_HEIGHT
		) {
			ballVX = -ballVX;
		}

		if (
			ballX + BALL_RADIUS > WIDTH - PADDLE_WIDTH &&
			ballY > computerY &&
			ballY < computerY + PADDLE_HEIGHT
		) {
			ballVX = -ballVX;
		}

		if (ballY < computerY + PADDLE_HEIGHT / 2) {
			computerY = Math.max(0, computerY - PADDLE_SPEED);
		} else {
			computerY = Math.min(HEIGHT - PADDLE_HEIGHT, computerY + PADDLE_SPEED);
		}
	}

	function resetBall() {
		ballX = WIDTH / 2;
		ballY = HEIGHT / 2;
		ballVX = BALL_SPEED;
		ballVY = BALL_SPEED;
	}

	function handleMouseMove(event: MouseEvent) {
		playerY = event.clientY - PADDLE_HEIGHT / 2;
	}

	function draw() {
		if (ctx) {
			ctx.clearRect(0, 0, WIDTH, HEIGHT);

			ctx.beginPath();
			ctx.arc(ballX, ballY, BALL_RADIUS, 0, 2 * Math.PI);
			ctx.fill();

			ctx.fillRect(0, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
			ctx.fillRect(WIDTH - PADDLE_WIDTH, computerY, PADDLE_WIDTH, PADDLE_HEIGHT);
		}
	}
</script>


<div class="flex flex-col justify-center items-center h-screen bg-gray-200">
    <div class="relative flex items-center justify-center w-full">
        <canvas bind:this={canvas} width={WIDTH} height={HEIGHT} on:mousemove={handleMouseMove}></canvas>
    </div>
    <button on:click={startGame} class="mb-4 p-2 bg-blue-500 text-white rounded mt-4">Start Game</button>
    <div>Player Score: {playerScore}</div>
    <div>Computer Score: {computerScore}</div>
</div>


<style>
	canvas {
		border: 1px solid black;
	}
</style>
