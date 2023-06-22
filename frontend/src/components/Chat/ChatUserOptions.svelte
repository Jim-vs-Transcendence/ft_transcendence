<script lang="ts">
    import type { ChatUserIF }  from '$lib/interface';
    
    export let chatUser: ChatUserIF;
    $: chatUser; // 어떤 차이가 있는지 확인 필요

    function fn(data: string) {
        console.log(data);
    }

</script>

<div class="card p-2 z-10 column-count-1" data-popup={chatUser._user_info.id}>
    <div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("invite");}}> 개인정보 </button></div>
	<div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("invite");}}>놀이 초대 {chatUser._user_info.id}</button></div>
	<div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("mute");}}>멈춰✋</button></div>
	<div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("kick");}}>내보내기</button></div>
	<div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("ban");}}>영구추방</button></div>
	<div class="hover:variant-filled-surface"><button class="cursor-pointer font-sans md:font-serif" on:click={()=>{fn("appoint");}}>부방장 임명</button></div>
	<div class="arrow bg-surface-100-800-token" />
</div>