<script lang="ts">
    export let opponent: string
    export let dmUserInfo: DmUserInfoIF
    export let userInfo: UserDTO
    export let dmStoreData: DmChatStoreIF
    
    import type { DmChatStoreIF, DmUserInfoIF } from '$lib/interface'
    import DmChatUI from "./DmChatUI.svelte"
    import { Avatar, modalStore } from '@skeletonlabs/skeleton'
    import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton'

    function ftDmChat() {
        const modalComponent: ModalComponent = {
            ref: DmChatUI,
            props: {opponent: opponent,
                    dmUserInfo: dmUserInfo,
                    userInfo: userInfo,
                    dmStoreData: dmStoreData}
        }

       const modal: ModalSettings = {
           type: 'component',
           component: modalComponent
        }
        modalStore.trigger(modal)
    }
</script>

<div class="cursor-pointer hover:variant-glass-surface" on:keypress={()=>{console.log("keypress")}} on:click={ftDmChat} >
    <Avatar
        bind:src={dmUserInfo._userInfo.avatar}
        width="w-7"
        rounded="rounded-full"
    />
    <span class="flex-auto">
        <!-- 프로필에서 변경한 nickname이 잘 적용되는지 확인 필요-->
        <dt>
            {opponent} | {dmUserInfo._userInfo.nickname}
        </dt>
    </span>
</div>
