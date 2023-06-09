<script lang="ts">
	import { goto } from "$app/navigation";

	
</script>
<div> here is chatroom </div>
<button on:mousedown={ () => (goto("/chat"))}> go back </button>
