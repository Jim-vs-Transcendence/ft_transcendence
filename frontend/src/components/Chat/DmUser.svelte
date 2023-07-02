<script lang="ts">
    export let opponent: string
    export let dmUserInfo: DmUserInfoIF
    export let userInfo: UserDTO
    export let dmStoreData: DmChatStoreIF
    
    import type { DmChatStoreIF, DmUserInfoIF } from '$lib/interface'
    import DmChatUI from "./DmChatUI.svelte"
    import { Avatar, modalStore } from '@skeletonlabs/skeleton'
    import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton'
    
    /**
     * 실제로 api요청해서 데이터 가져올때 필요 
     * userInfo 최신화시점. DM list tab에서 유저에 의해 click될때.
     * 실패해버림
     * modal이 제대로 동작하지 않는 이슈 발생
     * 해결 방법은 modal에서도 되도록 어떻게든 찾아서 하거나
     * DM chat UI 안에서만 갱신하거나
     * 현재 DM tab 클릭했을 때 갱신하므로 그때 하는 것으로 놔두거나
     * DM tab 자체도 5초마다 갱신하게 하거나 등등이 있다.
     * DM tab list에 있는 모든 유저에 대해 갱신하는 것이 맘에 안드므로 바꾸려면 DB를 쓰거나 다른 방식이 필요할 듯 싶다
     */
    /**
     * async function ftUpdateDmUser(): Promise<void> {
        try {
            dmUserInfo = await getApi({ path: 'user/' + opponent})
            if (typeof dmUserInfo === "string")
                return alert(opponent + ' user정보를 가져올 수 없습니다.')
            console.log("dmUserInfo : ")
            console.log(dmUserInfo)
        } catch (error) {
            alert('오류 : ' + opponent + ' user정보를 가져올 수 없습니다.')
        }
    }
    */

    /*
        - click했을때 DM창 뿌려주게 처리 필요
            DmUserInfo data 를 user id를 가지고 가져올 필요가 있다.
        - async를 호출하는 쪽에서도 항상 적용해야하는가?
        타고타고 가야하는가?
        a() -> b() -> c()
        b에서 c를 호출하는데 c()가 async일 필요가 있다면
        a,b,c모두 async여야 하는가?
        어쨋든 modal 호출하는 함수에 다른거 껴넣으면 modal에서 문제 발생하여 쓸 수 없음
    */
    function ftDmChat() {
        
        /*
            update userInfo 
        */
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
