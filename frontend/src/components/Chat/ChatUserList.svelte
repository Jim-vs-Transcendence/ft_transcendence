<script lang="ts">
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
    import { Avatar } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
    import { getApi, postApi, delApi } from '../../service/api';
    
    export let chatUser: ChatUserIF;
    $: chatUser;
    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
    // import { ChatUserIF } from '$lib/interface.d'
    // export let chatUser: chatUserDTO;
    // export let userInfo: UserDTO;
    // $: chatUser;


    enum chatUserRequestStatus {
        BLOCKED = 'blocked',
        PENDING = 'pending',
        ACCEPTED = 'accepted',
    }

    let isRefused = false;

    const goProfile = (name: string) => {
        goto('profile/' + name)
    };

    async function acceptchatUser(): Promise<void> {
        await postApi({
            path: 'chatUsers/requests/' + chatUser._user_info.id + '/accept',
            data: {}
        });
        chatUser = await getApi({
            path: 'chatUsers/' + chatUser._user_info.id,
        });
    }

    async function nochatUser(): Promise<void> {
        await delApi({
            path: 'chatUsers/requests/' + chatUser._user_info.id,
            data: {}
        });
        isRefused = true;
    }

    const popupFeatured: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: 'popupFeatured',
		// Defines which side of your trigger the popup will appear
		placement: 'bottom',
	};

    function fn() {

    }

    // tmp test
    let cnt : number = 0;

</script>

<ul class="list">
    
    </ul>

<dl class="list-dl">
    <li>
        <span> </span>
        <span class="flex-auto"> </span>
    </li>
    <!-- ... -->
    <div class="cursor-pointer">
        {#if !isRefused}
            <div class="flex-auto" >
                <span>
                    <dt use:popup={popupFeatured}> <Avatar src={chatUser._user_info.avatar} width="w-7" rounded="rounded-full" />  {chatUser._user_info.id} | {chatUser._user_info.nickname}  </dt>
                    <div class="card p-4 column-count-1" data-popup="popupFeatured">
                        <div><p class="cursor-point" on:click={ () => { fn() }}>profile</p></div>
                        <div><p class="cursor-pointer" on:click={ () => { fn() }}>invite game {chatUser._user_info.id}</p></div>
                        <div><p class="cursor-pointer" on:click={ () => { fn() }}>mute</p></div>
                        <div><p class="cursor-pointer" on:click={ () => { fn() }}>kick</p></div>
                        <div><p class="cursor-pointer" on:click={ () => { fn() }}>ban</p></div>
                        <div><p class="cursor-pointer" on:click={ () => { fn() }}>appoint</p></div>
                        <div class="arrow bg-surface-100-800-token" />
                    </div>
                </span>
                <span class="badge p-0">👑</span>
            </div>
            <!-- <span class="badge p-0">🗡️</span>
            <span class="badge p-0">🔇</span> -->
        {/if}
    </div>
    <!-- ... -->
</dl>


<!-- <div>
    <button class="btn variant-filled" >Show Popup</button>
</div> -->
