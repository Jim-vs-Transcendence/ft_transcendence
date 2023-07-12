<script lang="ts">
	import { createBrowserHistory } from 'history';
	import { onMount, onDestroy } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { gameSocketStore } from '$lib/webSocketConnection_game';
	import { goto } from '$app/navigation';
	import { gameClientOption } from '$lib/gameData';
	import { auth } from '../../service/store';
	import { petchApi } from '../../service/api';
	import Img from '$lib/JVT_gameLoading.gif'
	import music from "./great_rocky_music.mp3"
	import { Toast, toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	let io_game: Socket;

	const unsubscribeGame = gameSocketStore.subscribe((_gameSocket: Socket) => {
		io_game = _gameSocket;
	})

	const main = async () => {
		io_game.emit('queueOut', );
		audio.pause();
		await goto('/main');
	};

	async function handleBeforeUnload() {
		try {
			await petchApi({
				path: 'user/status/' + userInfo.id,
				data: {
					"user_status": 0,
				}
			});
		} catch {

		}
	}

	let audio: HTMLAudioElement;

	async function awesomePlay() {
		await audio.play();
	}

	let userInfo : UserDTO;


	function errorToast(msg: string) {
        const t: ToastSettings = {
            message: msg,
            hideDismiss: true,
            timeout: 3000
        };
        toastStore.trigger(t);
	}

	onMount(async() => {
		audio = new Audio(music);

		try{
			userInfo = await auth.isLogin();
		}
		catch(error){
			errorToast('오류 : 프로필을 출력할 수 없습니다1');
			await goto('/main');
		}

		if (io_game === undefined) {
			await goto('/main');
		}

		try {
			io_game.emit('pushMatchList', );

			io_game.on('roomName', (roomName: string) => {
				gameClientOption._roomName = roomName;
				audio.pause();
				goto('/game/option');
			});

			io_game.on('gotoMain', () => {
				goto('/main');
			});
		}
		catch (error) {
			await goto('/main');
		}

		window.addEventListener('beforeunload', handleBeforeUnload);
			return () => {
			unsubscribeGame();
			audio.pause();
			io_game.off('roomName');
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	})

</script>

<svelte:window on:popstate={main} />

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<div on:mouseenter={awesomePlay} on:click={main}>
			<img src={Img} alt="back to main">
		</div>
	</div>
</div>
<Toast max={5} />
