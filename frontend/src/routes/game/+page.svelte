<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { gameSocketStore } from '$lib/webSocketConnection_game';
	import { goto } from '$app/navigation';
	import { gameClientOption } from '$lib/gameData';
	import { auth } from '../../service/store';
	import { petchApi } from '../../service/api';
	import Img from '$lib/JVT_gameLoading.gif'
	import music from "./great_rocky_music.mp3"

	let io_game: Socket;

	const unsubscribeGame = gameSocketStore.subscribe((_gameSocket: Socket) => {
		io_game = _gameSocket;
	})

	const main = async () => {
		io_game.emit('queueOut', );
		console.log('wait back button clicked')
		await goto('/main');
	};

	async function handleBeforeUnload() {
		await petchApi({
			path: 'user/status/' + userInfo.id,
			data: {
				"user_status": 0,
			}
		});
	}

	let audio: HTMLAudioElement;

	function awesomePlay() {
		audio.play();
	}

	let userInfo : UserDTO;

	onMount(async() => {
		audio = new Audio(music);

		try{
			//1. token기반
			userInfo = await auth.isLogin();
		}
		catch(error){
			alert('오류 : 프로필을 출력할 수 없습니다1');
			await goto('/main');
		}

		if (io_game === undefined) {
			await goto('/main');
		}

		io_game.emit('pushMatchList', );

		io_game.on('roomName', (roomName: string) => {
			gameClientOption._roomName = roomName;
			console.log('got message from : ', roomName);
			goto('/game/option');
		});

		window.addEventListener('beforeunload', handleBeforeUnload);
			return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	})

	onDestroy(() => {
		unsubscribeGame();
		audio.pause();
		io_game.off('roomName');
	});

</script>

<svelte:window on:popstate={main}></svelte:window>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<div on:mouseenter={awesomePlay} on:click={main}>
			<img src={Img} alt="back to main">
		</div>
	</div>
</div>
