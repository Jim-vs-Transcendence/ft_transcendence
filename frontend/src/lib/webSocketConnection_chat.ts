const backUrl : string = import.meta.env.VITE_API_URL;

import { browser } from '$app/environment';
import ioClient, { Socket } from 'socket.io-client';
const ENDPOINT : string = backUrl + '/chat';
const DM_KEY : string = "dmdata"
//const ENDPOINT = 'http://localhost:3000/chat';
let userId : string | null = null;
let dmData : Map<string, string[]>; 

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
		if (loadDmChat)
			dmData = JSON.parse(loadDmChat);
		else
			dmData = new Map<string, string[]>();
		if (!dmData.has(data._to))
			dmData.set(data._to, []);
		dmData.get(data._to)?.push(data._msg);
		localStorage.setItem(DM_KEY, JSON.stringify(dmData));
	}
})

export const io_chat : Socket = socket;
