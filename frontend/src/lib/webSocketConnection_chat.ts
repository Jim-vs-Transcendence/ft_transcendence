const backUrl : string = import.meta.env.VITE_API_URL;

import { browser } from '$app/environment';
import ioClient, { Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';
import type { BlockedFriendIF, DmChatIF, DmChatStoreIF, DmUserInfoIF } from '$lib/interface';
import { goto } from '$app/navigation';
import { getApi } from '../service/api';

export const ENDPOINT : string = backUrl + '/chat';
export let DM_KEY : string = "dmdata_"
export let BlOCKED_USER_KEY : string = "blocked_user_list_"
export const socketStore : Writable<Socket> = writable();



export async function CreateSocket (socketStore : Writable<Socket>) {

	/** TODO
	 * local storage 혹은 메모리에 전역으로 차단된 유저 정보를 가지고 있는다
	 */
	let userId : string | null = null;
	let friendList: friendDTO[] = [];
	$: friendList

	const getFriendList = async (): Promise<void> => {
		try {
			friendList = await getApi({
				path: 'friends/',
			});
			console.log("friendList");
			console.log(friendList);
			let blockedFriendList : string[] = [];
			friendList.forEach(friend => {
				console.log("friend");
				console.log(friend);
				if (friend.friendStatus === FriendRequestStatus.BLOCKED) {
					blockedFriendList.push(friend.id);
				}
			});
			if (blockedFriendList.length !== 0) {
				console.log("blockedFriendList");
				console.log(blockedFriendList);
				localStorage.setItem(BlOCKED_USER_KEY, JSON.stringify(blockedFriendList));
				const loadBlockedFrindList : string | null = localStorage.getItem(BlOCKED_USER_KEY);
				if (loadBlockedFrindList) {
					console.log("loadBlockedFrindList");
					console.log(loadBlockedFrindList);
					let blockedFriends : BlockedFriendIF = JSON.parse(loadBlockedFrindList);
					blockedFriends._blockedFriendList.forEach((blockedFriend) => {
						console.log("blockedFriend");
						console.log(blockedFriend);
					})
				}
			}
			// 
		} catch (error) {
			console.log(error);
		}
	};
	
	if (browser) {
		userId = localStorage.getItem("userid");
		DM_KEY += userId
		BlOCKED_USER_KEY += userId
		getFriendList();
		// BlOCKED_USER_KEY로 차단된 유저 목록을 저장한다. 
		// 새롭게 차단하거나 차단 해제할떄 다시 localStorage에 저장해야한다.
		// TODO 잘 저장되는가?
		
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
				/** 차단 여부 확인
				 * data._from이 차단된 유저 리스트에 있는 유저인지 확인
				 * 
				 */
				// const loadBlockedFrindList : string | null = localStorage.getItem(BlOCKED_USER_KEY);
				// if (loadBlockedFrindList) {
				// 	let blockedFriends : BlockedFriendIF = JSON.parse(loadBlockedFrindList);
				// 	blockedFriends._blockedFriendList.forEach((blockedFriend) => {
				// 		if (blockedFriend === data._from)
				// 			return ;
				// 	})
				// }

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
