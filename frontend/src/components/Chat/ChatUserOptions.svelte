<script lang="ts">
    import type { ChatUserIF }  from '$lib/interface';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    // import { popup } from '@skeletonlabs/skeleton';
    // import { storePopup } from '@skeletonlabs/skeleton';
    
    export let chatUser: ChatUserIF;
    $: chatUser; // 어떤 차이가 있는지 확인 필요

    function fn() {
        console.log();
    }

</script>

<main>
    <div class="card p-4 column-count-1" data-popup={chatUser._user_info.id}>
        <div><p class="cursor-point">profile</p></div>
        <div><p class="cursor-pointer" >invite game {chatUser._user_info.id}</p></div>
        <div><p class="cursor-pointer" >mute</p></div>
        <div><p class="cursor-pointer" >kick</p></div>
        <div><p class="cursor-pointer" >ban</p></div>
        <div><p class="cursor-pointer" >appoint</p></div>
        <div class="arrow bg-surface-100-800-token" />
    </div>
</main>