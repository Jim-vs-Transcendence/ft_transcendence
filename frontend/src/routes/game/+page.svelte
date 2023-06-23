<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { afterUpdate } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import { gameSocketStore } from '$lib/webSocketConnection_game';
	import { goto } from '$app/navigation';
	import { gameClientOption } from '$lib/gameData';
	import { auth } from '../../service/store';
	import { petchApi } from '../../service/api';
	import Img from '$lib/tmp.png'

	let io_game: Socket;

	let	boundFlag: boolean = false;

	const unsubscribeGame = gameSocketStore.subscribe((_gameSocket: Socket) => {
		io_game = _gameSocket;
	})

	const main = async () => {
		io_game.emit('queueOut', );
		await goto('/main');
	};

	const handlePopstate = (event: any) => {
		console.log('Back button clicked');
		if (boundFlag === false) {
			io_game.emit('queueOut', );
			boundFlag = true;
		}
		goto('/main');
	};

	async function handleBeforeUnload() {
		await petchApi({
			path: 'user/status/' + userInfo.id,
			data: {
				"user_status": 0,
			}
		});
	}

	let userInfo : UserDTO;

	onMount(async() => {
		try{
			//1. token기반
			userInfo = await auth.isLogin();
		}
		catch(error){
			alert('오류 : 프로필을 출력할 수 없습니다1');
			goto('/main');
		}

		if (io_game === undefined) {
			goto('/main');
		}

		const state = { page: 'home' };
		const url = `/main`;
		window.history.pushState(state, '', url);

		window.addEventListener('popstate', handlePopstate);

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

		io_game.off('roomName');
		io_game.off('gotoMain');
	});

</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<img src={Img} alt="back to main" on:click={main}/>
	</div>
</div>
