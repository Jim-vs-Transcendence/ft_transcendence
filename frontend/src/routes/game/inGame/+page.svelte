<script lang="ts">
	import { onMount } from 'svelte';
	import { afterUpdate } from 'svelte';
	import { onDestroy } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { gameSocketStore } from '$lib/webSocketConnection_game';
	import { gameClientOption } from '$lib/gameData';
	import { goto } from '$app/navigation';

	let io_game: Socket;

	const unsubscribeGame = gameSocketStore.subscribe((_gameSocket: Socket) => {
		io_game = _gameSocket;
	})


	let cnt: number = 0;

	let canvas: HTMLCanvasElement;
	let	width: number;
	let height: number;
	let context: any;

	// Paddle
	let leftPaddleX: number;
	let rightPaddleX: number;

	let paddleWidth: number;
	let paddleHeight: number;

	// score
	let scoreTextSize: number;
	let scoreMargin: number;

	let score1X: number;
	let score2X: number;
	let scoreY: number;

	let leftScore: number;
	let rightScore: number;

	let	rdyFlag: boolean = false;

	let	status: number = 0;

	function resizeCanvas() {
		if (window.innerWidth <= 1200 || window.innerHeight <= 600)
		{
			cnt = -10;
			alert('👆👆👆👆👆👆 멈춰 👆👆👆👆👆👆👆👆👆');
		}
	}

	function setEndGame(flag: boolean) {
		if (flag) {
			context.globalAlpha = 1;
			context.font = `${scoreTextSize * 2}px Arial`;
			context.fillStyle = 'while';
			context.textAlign = 'center';
			context.fillText('You win', canvas.width / 2, canvas.height / 2);
		} else {
			context.globalAlpha = 1;
			context.font = `${scoreTextSize * 2}px Arial`;
			context.fillStyle = 'white';
			context.textAlign = 'center';
			context.fillText('You lose', canvas.width / 2, canvas.height / 2);
		}
	}

	function initPlayer(Player: any) {
		console.log(Player);
		canvas.width = Player.canvasWidth;
		canvas.height = Player.canvasHeight;
		width = canvas.width;
		height = canvas.height
		canvas.style.backgroundColor = Player.canvasColor;

		gameClientOption._ballRadius = Player.ballRadius;

		paddleWidth = Player.paddleWidth;
		paddleHeight = Player.paddleHeight;

		scoreTextSize = canvas.height * 0.3;
		scoreMargin = canvas.width * 0.2;

		leftPaddleX = Player.leftPaddleX;
		rightPaddleX = Player.rightPaddleX;

		score1X = canvas.width / 2 - scoreMargin;
		score2X = canvas.width / 2 + scoreMargin;
		scoreY = canvas.height / 2 + (scoreTextSize * 3) / 8;

		leftScore = Player.updateData.leftScore;
		rightScore = Player.updateData.rightScore;
	}

	function draw(moveData: any) {
		console.log(moveData);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.beginPath();
		context.arc(
			moveData.ballX,
			moveData.ballY,
			gameClientOption._ballRadius,
			0,
			Math.PI * 2,
			false
		);
		context.fillStyle = 'white';
		context.fill();
		context.closePath();

		context.globalAlpha = 0.5;
		context.font = `${scoreTextSize}px Arial`;
		context.fillStyle = 'white';
		context.textAlign = 'center';
		context.fillText(leftScore, score1X, scoreY);

		context.fillText(rightScore, score2X, scoreY);

		context.globalAlpha = 1;

		context.fillStyle = 'white';
		context.fillRect(leftPaddleX, moveData.leftPaddleY, paddleWidth, paddleHeight);

		context.fillStyle = 'white';
		context.fillRect(rightPaddleX, moveData.rightPaddleY, paddleWidth, paddleHeight);
	}

	function handleKeyPress(event: any) {
		if (event.key === 'Enter') {
			cnt++;
			console.log('enter press');
			if (cnt < 0) {
			} else if (cnt === 1 && rdyFlag === false) {
				rdyFlag = true;
				status = 1;
				io_game.emit('gameReady', gameClientOption._roomName);
			}
		} else if (event.key === 'ArrowDown') {
			io_game.emit('downKey', gameClientOption._roomName);
		} else if (event.key === 'ArrowUp') {
			io_game.emit('upKey', gameClientOption._roomName);
		} else if (event.key === 'Esc') {
			io_game.emit('gameRestart', gameClientOption._roomName);
		}
	}

	onMount(() => {
		if (io_game === undefined) {
			goto('/main');
		}

		canvas = document.createElement('canvas');
		context = canvas.getContext('2d');

		document.body.appendChild(canvas);

		window.addEventListener('resize', resizeCanvas);
		window.addEventListener('keydown', handleKeyPress);

		io_game.emit('inGamePageArrived', gameClientOption._roomName);

		io_game.on('gotoMain', (flag: boolean) => {
			if (flag) goto('/main');
		});

		io_game.on('gameDraw', (Player: any) => {
			initPlayer(Player);
			draw(Player.updateData.moveData);
		});

		io_game.on('restart', (flag: boolean) => {
			if (flag) {
				leftScore = 0;
				rightScore = 0;
			}
		});

		io_game.on('ballMove', (player: any) => {
			draw(player);
		});

		io_game.on('oneSetEnd', (player: any) => {
			leftScore = player.leftScore;
			rightScore = player.rightScore;
			draw(player.moveData);
		});

		io_game.on('gameEnd', (flag: boolean) => {
			status = 2;
			setEndGame(flag);
		});
	});

	onDestroy(() => {
		io_game.disconnect();
		document.body.removeChild(canvas);
		window.removeEventListener('keydown', handleKeyPress);
		unsubscribeGame();
	});

	// afterUpdate(() => {
	// 	// Code to handle updates or re-renders, if needed
	// });
</script>


<div>
	<div class="canvas-container">
		<div class="canvas-wrapper">
			<canvas bind:this={canvas} {width} {height} />
		</div>
	</div>
	<div class="button-container">
		{#if status === 0}
			준비하려면 Enter 누르세요
		{:else if status === 1}
			<div>
				player1
			</div>
			<div>
				player2
			</div>
		{:else if status === 2}
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
		{/if}
	</div>
</div>


	
<style>
	.container {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

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
