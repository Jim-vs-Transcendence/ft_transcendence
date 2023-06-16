const backUrl = import.meta.env.VITE_API_URL;
import ioClient from 'socket.io-client';
import { browser } from '$app/environment';

let userId : string | null = null;

const ENDPOINT = backUrl + '/game';

if (browser)
	userId = localStorage.getItem("userid");

const socket = ioClient(ENDPOINT, { 
	query: {
		key: userId,
}});

export const io_game = socket;
