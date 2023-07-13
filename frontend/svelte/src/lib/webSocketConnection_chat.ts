const backUrl : string = import.meta.env.VITE_API_URL;

import { browser } from '$app/environment';
import ioClient, { Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';
import type { DmChatIF, DmChatStoreIF, DmUserInfoIF } from '$lib/interface';
import { goto } from '$app/navigation';
import { getApi } from '../service/api';

export const ENDPOINT : string = backUrl + '/chat';
export let DM_KEY : string = "dmdata_"
export let BlOCKED_USER_KEY : string = "blocked_user_list_"
export const socketStore : Writable<Socket> = writable();

import { Toast, toastStore } from '@skeletonlabs/skeleton';
import type { ToastSettings } from '@skeletonlabs/skeleton';

function errorToast(msg: string) {
			const t: ToastSettings = {
					message: msg,
					hideDismiss: true,
					timeout: 3000
			};
			toastStore.trigger(t);
}

export async function CreateSocket (socketStore : Writable<Socket>) {

	let userId : string | null = null;
	let blockedFriendList: friendDTO[] = [];
	$: blockedFriendList

	const getblockedFriendList = async (): Promise<void> => {
		try {
			blockedFriendList = await getApi({
				path: 'friends/blocks/',
			});

			if (blockedFriendList.length !== 0)
				localStorage.setItem(BlOCKED_USER_KEY, JSON.stringify(blockedFriendList));
		} catch (error) {
			console.log(error);
		}
	};

	if (browser) {
		userId = localStorage.getItem("userid");
		DM_KEY += userId
		BlOCKED_USER_KEY += userId
		getblockedFriendList();
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
					throw console.log("JIM은 42의 황제 JIM이니라")
				 const loadBlockedFrindList : string | null = localStorage.getItem(BlOCKED_USER_KEY);
				 if (loadBlockedFrindList) {
					 let m = 1;
					 let blockedFriends : friendDTO[] = JSON.parse(loadBlockedFrindList);
					 blockedFriends.forEach(
						 (blockedFriend) => {
							 if (m == 0)
							 { return ; }
							 if (blockedFriend.id === data._from) {
								 return m = 0;
							 }
						 }
					 )
					 if (m == 0)
						 return ;
				 }

				const loadDmChat : string | null = localStorage.getItem(DM_KEY);
				let dmData : DmChatStoreIF = {};
				if (loadDmChat)
					dmData = JSON.parse(loadDmChat);
				if (!(dmData.hasOwnProperty(data._from)))
				{
					let searchedUser : UserDTO | null = await getApi({ path: 'user/' + data._from})
        			if (typeof searchedUser === "string" || searchedUser === null || searchedUser === undefined)
          				return errorToast(data._from + ' 유저정보 찾을 수 없습니다')
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
				errorToast('오류: 상대방의 생사유무를 확인할 수 없습니다. \n상대방이 메시지를 받을 수 없습니다. ')
			}
		}
	})

	socket.on("disconnect", () => {
		sessionStorage.setItem("isLogin", 'remove');
		goto("/");
	})
	socketStore.set(socket);
}
