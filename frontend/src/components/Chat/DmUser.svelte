<script lang="ts">
    import type { DmChatStoreIF } from '$lib/interface';
    import DmUserPopup from './DmUserPopup.svelte';

    export let dmChatStore: DmChatStoreIF;
    // export let userInfo: UserDTO; // 실제로 api요청해서 데이터 가져올때 필요 
    // $: userInfo;
    import ChatUI from "./ChatUI.svelte"
    import { Avatar, modalStore } from '@skeletonlabs/skeleton';
    import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
    import { getApi } from '../../service/api';

    /**
     * 실제로 api요청해서 데이터 가져올때 필요 
     */
    // async function getUserInfo(): Promise<void> {
    //     userInfo = await getApi({
    //         path: 'user/' + DmChatStore.opponent,
    //     });
    // }

    /*
        - click했을때 DM창 뿌려주게 처리 필요
            DmChatStore data 를 user id를 가지고 가져올 필요가 있다.
    */

    //DM에서도 프로필 보게 할지는 미정
    //프로필 팝업
    // import { storePopup } from '@skeletonlabs/skeleton';
    // import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

    // DM chat popup
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';

    // storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
    /*
        - dummy data 
    */
    // const userInfo: UserDTO =
    // {modalComponent jim",
    //     avatar: "https://cdn.intra.42.fr/users/0deac2fad263069699a587baaf629266/jim.JPG",
    //     email: "email",
    //     level: 0,
    //     win: 0,
    //     lose: 0,
    //     two_factor: false,
    //     user_status: 0,
    // };

    const dmPopupFeatured: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: "dmPopup" + dmChatStore.opponent,
		// Defines which side of your trigger the popup will appear
		placement: 'left',
	};

    function triggerModal() {
        const modalComponent: ModalComponent = {
            ref: ChatUI,
        };

        const modal: ModalSettings = {
            type: 'component',
            // Data
            component: modalComponent,
            response: (r: string) => console.log('response:', r),
        };
        modalStore.trigger(modal);
    }


</script>

<!-- <div class="cursor-pointer hover:variant-glass-surface" use:popup={dmPopupFeatured} > -->
    <!-- dmChatStore[dmChatStore.opponent]?._avatar ?? "" -->
<div class="cursor-pointer hover:variant-glass-surface" on:click={triggerModal} >
    <Avatar
        src={dmChatStore[Object.keys(dmChatStore)[0]]._avatar}
        width="w-7"
        rounded="rounded-full"
        />
    <span class="flex-auto">
        <dt>
            {Object.keys(dmChatStore)[0]}
        </dt>
    </span>
</div>
<!-- tmp -->
<!-- <DmUserPopup dmUserInfo={userInfo}/> -->
<!-- To be -->
<!-- dmUserdmChatStore -->
<!-- <DmUserPopup dmUserInfo={}/> -->