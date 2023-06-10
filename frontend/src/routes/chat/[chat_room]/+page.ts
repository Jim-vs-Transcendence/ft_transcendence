import { io_chat } from '$lib/webSocketConnection_chat';
import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad, RouteParams } from './$types';

export const load: PageLoad = async (
	url: LoadEvent<RouteParams, null, {}, '/chat/[chat_room]'>
) => {
	/**
	 * 접속 불가 url 막는 방식 생각해야함
	 */

	const url_data: PayLoadIF = { _url: url.params.chat_room, _check: true };
	return url_data;
};
