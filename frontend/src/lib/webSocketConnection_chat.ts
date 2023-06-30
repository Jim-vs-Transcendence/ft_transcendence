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
			try {
				const loadDmChat : string | null = localStorage.getItem(DM_KEY);
				let dmData : DmChatStoreIF = {};
				if (loadDmChat)
				dmData = JSON.parse(loadDmChat);
				dmData[data._from]._dmChatStore.push(data);
				localStorage.setItem(DM_KEY, JSON.stringify(dmData));
				console.log("before dm-received-msg ")
				console.log(data)
				// event로 등록하여 Dm Chat UI에서 수신 받을 수 있게 처리한다.
				// socket.emit("dm-received-msg", data);
				// const e = new Event("dm-received-msg", data);
				document.dispatchEvent(e);
				console.log("after dm-received-msg ")
			}
			catch (error) {
				alert('오류: 상대방의 생사유무를 확인할 수 없습니다. \n상대방이 메시지를 받을 수 없습니다.')
			}
		}
	})
	socketStore.set(socket);
}
