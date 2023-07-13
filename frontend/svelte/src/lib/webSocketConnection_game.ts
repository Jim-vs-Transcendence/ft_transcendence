const backUrl : string = import.meta.env.VITE_API_URL;
import ioClient, { Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

let userId : string | null = null;

const ENDPOINT = backUrl + '/game';

export const gameSocketStore : Writable<Socket> = writable();

export async function CreateGameSocket (socketStore : Writable<Socket>) {

	let userId : string | null = null;
	if (browser)
		userId = localStorage.getItem("userid");
	const socket : Socket = ioClient(ENDPOINT, {
		query: {
			_userId : userId,
	}});

	socket.on("disconnect", () => {
		sessionStorage.setItem("isLogin", 'remove');
		goto("/");
	});
	socketStore.set(socket);
}
