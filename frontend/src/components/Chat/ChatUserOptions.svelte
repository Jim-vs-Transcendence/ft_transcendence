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

<div class="card p-2 z-10 column-count-1" data-popup={chatUser._user_info.id}>
	<div class="py-2"><p class="cursor-point">profile</p></div>
	<div class="hover:bg-violet-300"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("invite");}}>놀이 초대 {chatUser._user_info.id}</button></div>
	<div class="hover:bg-violet-300"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("mute");}}>멈춰✋</button></div>
	<div class="hover:bg-violet-300"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("kick");}}>내보내기</button></div>
	<div class="hover:bg-violet-300"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("ban");}}>영구추방</button></div>
	<div class="hover:bg-violet-300"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("appoint");}}>부방장 임명</button></div>
	<div class="arrow bg-surface-100-800-token" />
</div>