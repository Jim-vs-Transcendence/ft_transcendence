<script lang="ts">
    export let opponent: string
    export let dmUserInfo: DmUserInfoIF
    export let userInfo: UserDTO

    import type { DmUserInfoIF } from '$lib/interface'
    import DmChatUI from "./DmChatUI.svelte"
    import { Avatar, modalStore } from '@skeletonlabs/skeleton'
    import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton'
    import { getApi } from '../../service/api'
    
    // To check 데이터구조 한 칸 더 안으로 들어갔으므로 제대로 key값을 가져오는지 확인 필요.

    /**
     * 실제로 api요청해서 데이터 가져올때 필요 
     * userInfo 최신화시점. DM list tab에서 유저에 의해 click될때.
     */
    // async function getUserInfo(): Promise<void> {
    //     userInfo = await getApi({
    //         path: 'user/' + DmUserInfo.opponent,
    //     })
    // }

    /*
        - click했을때 DM창 뿌려주게 처리 필요
            DmUserInfo data 를 user id를 가지고 가져올 필요가 있다.
    */
    function ftDmChat() {
        const modalComponent: ModalComponent = {
            ref: DmChatUI,
            props: {opponent: opponent,
                    dmUserInfo: dmUserInfo,
                    userInfo: userInfo}
        }

        const modal: ModalSettings = {
            type: 'component',
            component: modalComponent,
            // response: (r: string) => console.log('response:', r),
            /*
                response로 call back함수를 주어서 
                대화한 DM 내역을 local storage에 저장하게 하는게 나을것인가?
                아니면 대화가 진행된 DmChatUI에서 local storage에 저장되게 할 것인가?
                상대로부터 수신 받은 데이터는 local storage에 저장되게 되어있다고 하지만 
                내가 보낸것도 그러한지는 확인 필요.
            */
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
        <dt>
            {opponent} | {dmUserInfo._userInfo.nickname}
        </dt>
    </span>
</div>
