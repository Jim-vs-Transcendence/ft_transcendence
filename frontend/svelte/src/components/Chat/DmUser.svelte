<script lang="ts">
    import type { DmChatStoreIF, DmUserInfoIF } from '$lib/interface'
    import DmChatUI from "./DmChatUI.svelte"
    import { Avatar, modalStore } from '@skeletonlabs/skeleton'
    import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton'

    export let opponent: string
    export let dmUserInfo: DmUserInfoIF
    export let userInfo: UserDTO
    export let dmStoreData: DmChatStoreIF

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

<div
    class="cursor-pointer hover:variant-glass-surface"
    role="button"
    tabindex="0"
    on:click={ftDmChat}
    on:keydown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
            ftDmChat();
        }
    }}
>
    <Avatar
        bind:src={dmUserInfo._userInfo.avatar}
        width="w-7"
        rounded="rounded-full"
    />
    <span class="flex-auto">
        <dt>
            {opponent} | {dmUserInfo._userInfo.nickname}
        </dt>
    </span>
</div>
