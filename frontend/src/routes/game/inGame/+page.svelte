<script lang="ts">
	import type { Socket } from 'socket.io-client';
	import type { GamePlayerData, GameUpdateData, GameMoveData } from '$lib/gameData';
	import { onMount, onDestroy } from 'svelte';
	import { gameSocketStore } from '$lib/webSocketConnection_game';
	import { gameClientOption } from '$lib/gameData';
	import { auth } from '../../../service/store';
	import { petchApi } from '../../../service/api';
	import { goto } from '$app/navigation';

	let io_game: Socket;

	const unsubscribeGame = gameSocketStore.subscribe((_gameSocket: Socket) => {
		io_game = _gameSocket;
	});

	let cnt: number = 0;

	let canvas: HTMLCanvasElement;
	let width: number;
	let height: number;
	let context: CanvasRenderingContext2D;

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

	let leftPlayer: string;
	let rightPlayer: string;

	let rdyFlag: boolean = false;

	let status: number = 0;

	let retryCnt: number = 0;
	let boundFlag: boolean = false;

	function resizeCanvas() {
		if (window.innerWidth <= 1200 || window.innerHeight <= 600) {
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
			context.fillText('You win', width / 2, height / 2);
		} else {
			context.globalAlpha = 1;
			context.font = `${scoreTextSize * 2}px Arial`;
			context.fillStyle = 'white';
			context.textAlign = 'center';
			context.fillText('You lose', width / 2, height / 2);
		}
	}

	function initPlayer(Player: GamePlayerData) {
		console.log(Player);
		console.log('init Player', Player.canvasWidth);
		canvas.width = Player.canvasWidth;
		canvas.height = Player.canvasHeight;
		width = canvas.width;
		height = canvas.height;
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

		leftPlayer = Player.myId;
		rightPlayer = Player.urId;
	}

	function draw(moveData: GameMoveData) {
		console.log(moveData);
		context.clearRect(0, 0, width, height);
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
		context.fillText(leftScore.toString(), score1X, scoreY);

		context.fillText(rightScore.toString(), score2X, scoreY);

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

	const handlePopstate = (event: any) => {
		window.removeEventListener('popstate', handlePopstate);
		console.log('Back button clicked');
		if (boundFlag === false) {
			io_game.emit('gameQuit');
			boundFlag = true;
		}
		goto('/main');
	};

	let userInfo: UserDTO;

	async function handleBeforeUnload() {
		await petchApi({
			path: 'user/status/' + userInfo.id,
			data: {
				user_status: 0
			}
		});
	}

	function retryGame() {
		retryCnt++;
		if (retryCnt === 1) {
			io_game.emit('gameRestart', gameClientOption._roomName);
		}
	}

	async function getGameData(): Promise<GamePlayerData> {
		return new Promise((resolve, reject) => {
			io_game.on('gameDraw', (userData: GamePlayerData) => {
				resolve(userData);
			});
		});
	}

	async function handleGameDraw() {
		try {
			const userData = await getGameData();
			initPlayer(userData);
			draw(userData.updateData.moveData);
			console.log('Received game draw data:', userData);
		} catch (error) {
			console.error('Failed to receive game draw data:', error);
		}
	}

	async function getBallData(): Promise<GameMoveData> {
		return new Promise((resolve, reject) => {
			io_game.on('ballMove', (moveData: GameMoveData) => {
				console.log('game draw');
				resolve(moveData);
			});
		});
	}

	async function getGameMoveData() {
		try {
			const moveData = await getBallData();
			draw(moveData);
		} catch (error) {
			console.error('Failed to receive game draw data:', error);
		}
	}

	async function getUpdateData(): Promise<GameUpdateData> {
		return new Promise((resolve, reject) => {
			io_game.on('oneSetEnd', (updateData: GameUpdateData) => {
				resolve(updateData);
			});
		});
	}

	async function getGameUpdateData() {
		try {
			const updateData = await getUpdateData();
			leftScore = updateData.leftScore;
			rightScore = updateData.rightScore;
			draw(updateData.moveData);
		} catch (error) {
			console.error('Failed to receive game draw data:', error);
		}
	}

	onMount(async () => {
		if (io_game === undefined) {
			goto('/main');
		}

		try {
			//1. token기반
			userInfo = await auth.isLogin();
		} catch (error) {
			alert('오류 : 프로필을 출력할 수 없습니다1');
			goto('/main');
		}

		io_game.emit('inGamePageArrived', gameClientOption._roomName);

		handleGameDraw();

		const state = { page: 'home' };
		const url = `/main`;
		window.history.pushState(state, '', url);

		window.addEventListener('popstate', handlePopstate);

		console.log('what is the type of the canvas?', typeof canvas);
		context = canvas.getContext('2d')!;

		window.addEventListener('resize', resizeCanvas);
		window.addEventListener('keydown', handleKeyPress);

		io_game.on('gotoMain', (flag: boolean) => {
			console.log('is in here?');
			if (flag) {
				goto('/main');
			}
		});

		io_game.on('restart', (flag: boolean) => {
			status = 1;
			if (flag) {
				leftScore = 0;
				rightScore = 0;
			}
		});

		io_game.on('gameEnd', (flag: boolean) => {
			status = 2;
			retryCnt = 0;
			setEndGame(flag);
		});

		io_game.on('ballMove', (player: GameMoveData) => {
			draw(player);
		});

		io_game.on('oneSetEnd', (player: GameUpdateData) => {
			leftScore = player.leftScore;
			rightScore = player.rightScore;
			draw(player.moveData);
		});

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	onDestroy(() => {
		io_game.off('gameReady');
		io_game.off('gameDraw');
		io_game.off('ballMove');
		io_game.off('oneSetEnd');
		io_game.off('gotoMain');
		io_game.off('restart');
		io_game.off('gameEnd');
		window.removeEventListener('resize', resizeCanvas);
		window.removeEventListener('keydown', handleKeyPress);
		unsubscribeGame();
	});
</script>

<div class="flex flex-col justify-center items-center h-screen bg-gray-200">
	<div class="relative flex items-center justify-center w-full">
		<canvas bind:this={canvas} {width} {height} />
	</div>
	<div class="button-container">
		{#if status === 0}
			준비하려면 Enter 누르세요
		{:else if status === 1}
			<div class="player-container">{leftPlayer}</div>
			<div class="player-container">{rightPlayer}</div>
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
				on:click={retryGame}
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

	.player-container {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: bold;
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
