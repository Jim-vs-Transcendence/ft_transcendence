const backUrl : string = import.meta.env.VITE_API_URL;

import { browser } from '$app/environment';
import ioClient, { Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';
import type { DmChatIF, DmChatStoreIF } from '$lib/interface';

export const ENDPOINT : string = backUrl + '/chat';
export let DM_KEY : string = "dmdata_"
export const socketStore : Writable<Socket> = writable();
//const ENDPOINT = 'http://localhost:3000/chat';

export async function CreateSocket (socketStore : Writable<Socket>) {

	let userId : string | null = null;
	if (browser) {
		userId = localStorage.getItem("userid");
		DM_KEY += userId
	}
	const socket : Socket = ioClient(ENDPOINT, { 
		query: {
			_userId : userId
	}});
	
	socket.on("dm-chat", (data : DmChatIF) => {
		if (browser)
		{
			const loadDmChat : string | null = localStorage.getItem(DM_KEY);
			let dmData : DmChatStoreIF = {};
			if (loadDmChat)
				dmData = JSON.parse(loadDmChat);
			dmData[data._from]._dmChatStore.push(data);
			localStorage.setItem(DM_KEY, JSON.stringify(dmData));
			console.log("before dm-received-msg ")
			console.log(data)
			socket.emit("dm-received-msg", data);
			console.log("after dm-received-msg ")
		}
	})
	socketStore.set(socket);
}
