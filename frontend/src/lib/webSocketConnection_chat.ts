const backUrl : string = import.meta.env.BACK_URL;

import { browser } from '$app/environment';
import ioClient from 'socket.io-client';
const ENDPOINT = backUrl + '/chat';

let userId : string | null = null;

//const ENDPOINT = 'http://localhost:3000/chat';

if (browser)
	userId = localStorage.getItem("userid");

const socket = ioClient(ENDPOINT, { 
	query: {
		userId: userId,
}});


export const io_chat = socket;
