import { io_chat } from '$lib/webSocketConnection_chat';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	io_chat.emit('room-refresh', 'page load chat list');
};
