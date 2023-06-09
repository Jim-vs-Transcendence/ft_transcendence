<script lang='ts'>
	import { goto } from "$app/navigation";
	import { io_chat } from "$lib/webSocketConnection_chat";

	io_chat;

	function ft_goto_chatroom(room_select: string)
	{
		goto('/chat/' + room_select);
	}

</script>
