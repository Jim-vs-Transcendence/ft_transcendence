<script lang="ts">
	import type { ChatRoomJoinIF } from '$lib/interface';
	
	// Stores
	import { modalStore } from '@skeletonlabs/skeleton';
	import { socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy } from 'svelte';
	
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;

	let chat_socket : Socket;

	const chat_unsubscribe = socketStore.subscribe((_socket : Socket) => {
		chat_socket = _socket;
	})

	const roomData : ChatRoomJoinIF= {
		_room_name: '',
		_room_password: '',
		_is_passworded: false,
		_pass: false,
		_ban: false,
	};

	function onRoomDataSubmitKeyDown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault()
			onRoomDataSubmit()
		}
	}

	// We've created a custom submit function to pass the response and close the modal.
	function onRoomDataSubmit(): void {
		roomData._room_name = roomData._room_name.trim()
		if (!(roomData._room_name)) {
			alert('방이름을 입력하세요');
		}
		else {
			if ($modalStore[0].response)
				$modalStore[0].response(roomData);
			modalStore.close();
		}
	}

	onDestroy(chat_unsubscribe);
	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<!-- Enable for debugging: -->
		<form class="modal-form {cForm}">
			<label class="label">
				<span>대화방 이름</span>
				<input class="input" type="text" on:keydown={onRoomDataSubmitKeyDown} bind:value={roomData._room_name} placeholder="대화방 이름" />
			</label>
			<label class="label">
				<span>대화방 비밀번호</span>
				<input class="input" type="tel" on:keydown={onRoomDataSubmitKeyDown} bind:value={roomData._room_password} placeholder="대화방 비밀번호" />
			</label>
		</form>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={modalStore.close}>취소</button>
        <button class="btn {parent.buttonPositive}" on:click={onRoomDataSubmit}>대화방 생성</button>
    </footer>
	</div>
{/if}