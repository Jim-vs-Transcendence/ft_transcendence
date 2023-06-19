<script lang="ts">
    import type { ChatUserIF }  from '$lib/interface';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    // import { popup } from '@skeletonlabs/skeleton';
    // import { storePopup } from '@skeletonlabs/skeleton';
    
    export let chatUser: ChatUserIF;
    $: chatUser; // 어떤 차이가 있는지 확인 필요

    function fn(data: string) {
        console.log(data);
    }

</script>

<div class="card p-4 z-10 column-count-1" data-popup={chatUser._user_info.id}>
	<div><p class="cursor-point">profile</p></div>
	<div><button class="cursor-pointer" on:click={()=>{fn("invite");}}>invite game {chatUser._user_info.id}</button></div>
	<div><button class="cursor-pointer" on:click={()=>{fn("mute");}}>mute</button></div>
	<div><button class="cursor-pointer" on:click={()=>{fn("kick");}}>kick</button></div>
	<div><button class="cursor-pointer" on:click={()=>{fn("ban");}}>ban</button></div>
	<div><button class="cursor-pointer" on:click={()=>{fn("appoint");}}>appoint</button></div>
	<div class="arrow bg-surface-100-800-token" />
</div>