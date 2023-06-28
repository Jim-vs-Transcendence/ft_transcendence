<script lang="ts">
    import type { DmUserInfoIF } from '$lib/interface';

    export let dmUserInfo: DmUserInfoIF;
    export let userInfo: UserDTO;
    // export let userInfo: UserDTO; // 실제로 api요청해서 데이터 가져올때 필요 
    // $: userInfo;
    import DmChatUI from "./DmChatUI.svelte"
    import { Avatar, modalStore } from '@skeletonlabs/skeleton';
    import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
    import { getApi } from '../../service/api';


    // To check 데이터구조 한 칸 더 안으로 들어갔으므로 제대로 key값을 가져오는지 확인 필요.
    const opponent : string = Object.keys(dmUserInfo)[0];

    /**
     * 실제로 api요청해서 데이터 가져올때 필요 
     */
    // async function getUserInfo(): Promise<void> {
    //     userInfo = await getApi({
    //         path: 'user/' + DmUserInfo.opponent,
    //     });
    // }

    /*
        - click했을때 DM창 뿌려주게 처리 필요
            DmUserInfo data 를 user id를 가지고 가져올 필요가 있다.
    */

    //DM에서도 프로필 보게 할지는 미정
    //프로필 팝업
    // import { storePopup } from '@skeletonlabs/skeleton';
    // import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

    // DM chat popup
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';

    const dmPopupFeatured: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: "dmPopup" + opponent,
		// Defines which side of your trigger the popup will appear
		placement: 'left',
	};

    function ftDmChat() {
        const modalComponent: ModalComponent = {
            ref: DmChatUI,
            props: {dmUserInfo: dmUserInfo,
                    userInfo: userInfo},
        };

        const modal: ModalSettings = {
            type: 'component',
            component: modalComponent,
            response: (r: string) => console.log('response:', r),
        };
        modalStore.trigger(modal);
    }
</script>

<div class="cursor-pointer hover:variant-glass-surface" on:click={ftDmChat} >
    <Avatar
        src={dmUserInfo[opponent]._userInfo.avatar}
        width="w-7"
        rounded="rounded-full"
        />
    <span class="flex-auto">
        <dt>
            {opponent}
        </dt>
    </span>
</div>
