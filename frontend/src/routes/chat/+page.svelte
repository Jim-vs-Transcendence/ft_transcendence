<script lang='ts'>
	import { goto } from "$app/navigation";
	import { io_chat } from "$lib/webSocketConnection_chat";
	import { each } from "svelte/internal";

	let	rooms_list : string [] = [];


	io_chat.on("room-refresh", ( data : string []) => {
		rooms_list = [...data ]
	});


	function JoinRoom(room_select: string)
	{
		goto('/chat/' + room_select);
	};

</script>
<lu>
{#each rooms_list as room}
	<li id="room" on:keydown={ () => { JoinRoom(room) } }  > {room} </li>
{/each}
</lu>
