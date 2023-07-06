const backUrl : string = import.meta.env.VITE_API_URL;

import { browser } from '$app/environment';
import ioClient, { Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';
import type { DmChatIF, DmChatStoreIF, DmUserInfoIF } from '$lib/interface';
import { authToken } from '../service/store';
import { goto } from '$app/navigation';
import { getApi } from '../service/api';

export const ENDPOINT : string = backUrl + '/chat';
export let DM_KEY : string = "dmdata_"
export const socketStore : Writable<Socket> = writable();

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

	
	socket.on("dm-chat", async (data : DmChatIF) => {
		if (browser)
		{
			try {
				if (userId === data._from)
					throw console.log("userId === data._from")
				const loadDmChat : string | null = localStorage.getItem(DM_KEY);
				let dmData : DmChatStoreIF = {};
				if (loadDmChat)
					dmData = JSON.parse(loadDmChat);
				if (!(dmData.hasOwnProperty(data._from)))
				{
					let searchedUser : UserDTO | null = await getApi({ path: 'user/' + data._from})
        			if (typeof searchedUser === "string" || searchedUser === null || searchedUser === undefined)
          				return alert(data._from + ' user정보 찾을 수 없습니다')
					let newDmChatStore : DmUserInfoIF = {
						_userInfo: searchedUser,
						_dmChatStore: [],
					}
					dmData[data._from] = newDmChatStore;
				}
				dmData[data._from]._dmChatStore.push(data);
				localStorage.setItem(DM_KEY, JSON.stringify(dmData));
			}
			catch (error) {
				alert('오류: 상대방의 생사유무를 확인할 수 없습니다. \n상대방이 메시지를 받을 수 없습니다. ')
			}
		}
	})

	socket.on("disconnect", () => {
		sessionStorage.setItem("isLogin", 'remove');
		goto("/");
	})
	socketStore.set(socket);
}
