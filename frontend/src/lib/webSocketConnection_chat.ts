const backUrl : string = import.meta.env.VITE_API_URL;

import { browser } from '$app/environment';
import ioClient, { Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';
import type { DmChatIF, DmChatStoreIF } from '$lib/interface';

export const ENDPOINT : string = backUrl + '/chat';
export let DM_KEY : string = "dmdata_"
export let customEventElement : any;
$: customEventElement
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
				console.log("dm-chat in webSocketConnection")
				console.log(data)
				// event로 등록하여 Dm Chat UI에서 수신 받을 수 있게 처리한다.
				// socket.emit("dm-received-msg", data);
				// try {
				// 	customEventElement.dispatchEvent(new CustomEvent("dm-received-msg", {detail: {msg: data}}))
				// }
				// catch (error) {
				// 	alert('오류: customEventElement.dispatchEvent(new CustomEvent("dm-received-msg", {detail: {msg: data}}))')	
				// }


				// const customEvent = new CustomEvent("dm-received-msg", {detail: {msg: data}});
				// const element = document.getElementById('myElement')
				// element?.dispatchEvent(customEvent)
				// document.dispatchEvent(e)`;
			}
			catch (error) {
				alert('오류: 상대방의 생사유무를 확인할 수 없습니다. \n상대방이 메시지를 받을 수 없습니다. in websocket')
			}
		}
	})
	socketStore.set(socket);
}
