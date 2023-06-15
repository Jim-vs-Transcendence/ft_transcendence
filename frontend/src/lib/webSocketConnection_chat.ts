const backUrl : string = import.meta.env.VITE_API_URL;

import { browser } from '$app/environment';
import ioClient, { Socket } from 'socket.io-client';
import { onMount } from 'svelte';
import { writable, type Writable } from 'svelte/store';

export const ENDPOINT : string = backUrl + '/chat';
export const DM_KEY : string = "dmdata"
export const socketStore : Writable<Socket> = writable();
//const ENDPOINT = 'http://localhost:3000/chat';

export async function CreateSocket (socketStore : Writable<Socket>) {

	let userId : string | null = null;
	if (browser)
		userId = localStorage.getItem("userid");
	const socket : Socket = ioClient(ENDPOINT, { 
		query: {
			userid : userId,
	}});
	
	socket.on("dm-chat", (data : DmChatIF) => {
		if (browser)
		{
			const loadDmChat : string | null = localStorage.getItem(DM_KEY);
			let dmData : DmChatStoreIF = {};
			if (loadDmChat)
				dmData = JSON.parse(loadDmChat);
			dmData[data._from].push(data);
			localStorage.setItem(DM_KEY, JSON.stringify(dmData));
		}
	})
	socketStore.set(socket);
}
