<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '../../../service/store';
	import { petchApi } from '../../../service/api';
	import { gameClientOption } from '$lib/gameData';
	import { gameSocketStore } from '$lib/webSocketConnection_game';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';

	let io_game: Socket;

	const unsubscribeGame = gameSocketStore.subscribe((_gameSocket: Socket) => {
		io_game = _gameSocket;
	});

	let cnt: number = 0;

	// const match = async () => {
	// 	await goto('/game/inGame');
	// };

	function setReady() {
		cnt++;
		console.log('set Ready');
		if (cnt === 1) {
			optionEmit();
		}
	}

	let score: number = 3;
	let color: string = 'black';
	let ballSize: number = 10;
	$: ballSize;
	$: color;

	import { RangeSlider } from '@skeletonlabs/skeleton';
	let value: number;

	// function을 새로 정의하여 value값을 매개변수로 넘긴다

	function optionEmit() {
		console.log(score, color, ballSize);
		gameClientOption._gameScore = score;
		gameClientOption._canvasColor = color;
		gameClientOption._ballRadius = ballSize;
		console.log(gameClientOption);
		io_game.emit('optionReady', gameClientOption);
	}

	function setScore() {
		const input: string | null = prompt(
			'몇판 내기 게임인가요? 숫자를 가이드의 안내에 따라 신중하게 입력하세요'
		);
		if (input === null) {
			return null;
		}
		const num: number = parseInt(input, 10);
		if (num === 3) {
			score = 3;
			// scoreEmit();
		} else if (num == 5) {
			score = 5;
			// scoreEmit();
		} else if (num == 6) {
			score = 6;
			// scoreEmit();
		} else if (num >= 10) {
			alert('사용자의 피로도를 고려해 10점 이상은 진행할 수 없습니다');
		} else {
			alert('잘못된 숫자입니다.');
		}
	}

	function setRed() {
		color = 'red';
	}

	function setBlack() {
		color = 'black';
	}
	function setBlue() {
		color = 'blue';
	}

	function onComplete() {
		isColorSelect = false;
	}

	function isClick() {
		if (isColorSelect === false) {
			isColorSelect = true;
		} else {
			isColorSelect = false;
		}
	}

	import { Stepper, Step } from '@skeletonlabs/skeleton';
	let isColorSelect: boolean = false;

	function onStepHandler(e: { step: number; state: { current: number; total: number }; }): void {
		if (e.detail.state.current === 3) {
			const input: string | null = prompt(
				'문제 : 조금 전 예문에서 나온 color의 개수는 몇 개 인가요?'
			);
			if (input === null) {
				alert('정답을 입력하세요');
				isColorSelect = false;
			}
			const num: number = parseInt(input, 10);
			if (num === 30) {
			} else {
				alert('오답입니다');
				isColorSelect = false;
			}
		}
	}

	function setBallSize() {
		if (value === 3) {
			ballSize = 100;
		} else if (value === 15) {
			ballSize = 5;
		} else {
			ballSize = 35 - value;
		}
		// ballSizeEmit();
	}

	let boundFlag: boolean = false;

	const handlePopstate = (event: any) => {
		console.log('Back button clicked');
		if (boundFlag === false) {
			io_game.emit('gameQuit');
			boundFlag = true;
		}
		goto('/main');
	};

	async function handleBeforeUnload() {
		await petchApi({
			path: 'user/status/' + userInfo.id,
			data: {
				user_status: 0
			}
		});
	}

	let userInfo: UserDTO;
	// 옵션 페이지에서만 작동 안 함. 왜
	onMount(async () => {
		if (io_game === undefined) {
			console.log('user refresh');
			goto('/main');
		}

		try {
			//1. token기반
			userInfo = await auth.isLogin();
		} catch (error) {
			alert('오류 : 프로필을 출력할 수 없습니다1');
			goto('/main');
		}

		const state = { page: 'home' };
		const url = `/main`;
		window.history.pushState(state, '', url);

		window.addEventListener('popstate', handlePopstate);

		io_game.emit('optionPageArrived');

		io_game.on('gotoMain', (flag: boolean) => {
			if (flag) {
				goto('/main');
			}
		});

		io_game.on('optionReady', (flag: boolean) => {
			if (flag) {
				goto('/game/inGame');
			}
		});

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	onDestroy(() => {
		unsubscribeGame();
		io_game.off('gotoMain');
		io_game.off('optionReady');
		io_game.off('gameQuit');
	});
</script>

<div class="flex h-screen items-center justify-center">
	<ul
		class="list flex-col w-screen h-screen transform scale-200 fixed inset-0 flex items-center justify-center"
	>
		<li>
			<span class="flex justify-center items-center text-2xl">ㅇ옵션ㅇ</span>
		</li>
		{#if io_game.id === gameClientOption._roomName}
			<li>
				<span class="flex justify-center items-center" on:click={setScore}
					>"참 잘했어요" 도장 개수 변경</span
				>
			</li>
			<li>
				<span class="flex justify-center items-center">병풍 색 조절</span>
				<button type="button" class="btn variant-filled" on:click={isClick}>색깔 변경</button>
				{#if isColorSelect === true}
					<Stepper on:step={onStepHandler} on:complete={onComplete}>
						<Step>
							<svelte:fragment slot="header">색깔 설정</svelte:fragment>
							색깔 설정을 해보겠습니다
						</Step>
						<Step>
							<svelte:fragment slot="header">색깔 설정</svelte:fragment>
							첫번째 단계는 색깔에 대한 이해입니다.
						</Step>
						<Step>
							<svelte:fragment slot="header">색깔 개론</svelte:fragment>
							색깔이란, Color (American English) or colour (Commonwealth English) is the visual perception
							based on the electromagnetic spectrum. Though color is not an inherent property of matter,
							color perception is related to an object's light absorption, reflection, emission spectra
							and interference. For most humans, color are perceived in the visible light spectrum with
							three types of cone cells (trichromacy). Other animals may have a different number of cone
							cell types or have eyes sensitive to different wavelength, such as bees that can distinguish
							ultraviolet, and thus has a different color sensitivity range. Animal perception of color
							originates from different light wavelength or spectral sensitivity in cone cell types,
							which is then processed by the brain. Colors have perceived properties such as hue, colorfulness
							(saturation) and luminance. Colors can also be additively mixed (commonly used for actual
							light) or subtractively mixed (commonly used for materials). If the colors are mixed in
							the right proportions, because of metamerism, they may look the same as a single-wavelength
							light. For convenience, colors can be organized in a color space, which when being abstracted
							as a mathematical color model can assign each region of color with a corresponding set
							of numbers. As such, color spaces are an essential tool for color reproduction in print,
							photography, computer monitors and television. The most well-known color models are RGB,
							CMYK, YUV, HSL and HSV. Because the perception of color is an important aspect of human
							life, different colors have been associated with emotions, activity, and nationality. Names
							of color regions in different cultures can have different, sometimes overlapping areas.
							In visual arts, color theory is used to govern the use of colors in an aesthetically pleasing
							and harmonious way. The theory of color includes the color complements; color balance;
							and classification of primary colors (traditionally red, yellow, blue), secondary colors
							(traditionally orange, green, purple) and tertiary colors. The study of colors in general
							is called color science.
						</Step>
						<Step>
							<svelte:fragment slot="header">쉬어가는 공간</svelte:fragment>
							이제 거의 다 왔습니다.
						</Step>
						<Step>
							<svelte:fragment slot="header">현재 색 : {color}</svelte:fragment>

							<div class="grid-cols-1 lg:!grid-cols-3 gap-1">
								<button
									type="button"
									class="btn btn-xl variant-filled"
									on:click={setRed}
									style="background-color: red">빨강</button
								>
								<button
									type="button"
									class="btn btn-xl variant-filled"
									on:click={setBlack}
									style="background-color: black">까망</button
								>
								<button
									type="button"
									class="btn btn-xl variant-filled"
									on:click={setBlue}
									style="background-color: blue">파랑</button
								>
							</div>
						</Step>
					</Stepper>
				{/if}
			</li>
			<li>
				<span class="flex justify-center items-center">Ball 42즈 : </span>
				<RangeSlider name="range-slider" bind:value max={25} on:change={setBallSize} ticked
					>{ballSize}</RangeSlider
				>
			</li>
		{:else}
			<span class="flex justify-center item-center">호스트가 설정할 때 까지 기다리세요</span>
		{/if}
		<button
			class="skeleton-button variant-glass-secondary btn-lg rounded-lg transition-transform duration-200 ease-in-out hover:scale-110"
			data-sveltekit-preload-data="hover"
			on:click={setReady}>게임 시작</button
		>
	</ul>
</div>
