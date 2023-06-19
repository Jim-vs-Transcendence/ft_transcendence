<script lang="ts">
	import { goto } from '$app/navigation';
	import { socketStore, DM_KEY } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy, onMount } from 'svelte';
	import type { DmChatIF, DmChatStoreIF } from '$lib/interface';

	let socket: Socket;
	let dmStoreData : DmChatStoreIF;
	let dmChatData : DmChatIF;

	const unsubscribe = socketStore.subscribe((_socket: Socket) => {
		socket = _socket;
	});

	onMount(async () => {
		try {
			const loadDmChat : string | null = localStorage.getItem(DM_KEY);
			if (loadDmChat)
				dmStoreData = JSON.parse(loadDmChat);
		} catch (error) {
			console.log('DM loading error');
		}
	});

	onDestroy(unsubscribe);

	function sendDm(opponent : string)
	{
		dmStoreData[opponent].push(dmChatData);
		localStorage.setItem(DM_KEY, JSON.stringify(dmStoreData));
		if (dmChatData._msg.length && dmChatData._msg != '\n')
			socket.emit('dm-chat', dmChatData);
	}
</script>

