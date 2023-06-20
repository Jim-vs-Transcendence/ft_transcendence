<script lang="ts">
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
    import { Avatar } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
    import { getApi, postApi, delApi } from '../../service/api';
    import type { ChatUserIF }  from '$lib/interface';
	import ChatUserOptions from './ChatUserOptions.svelte';
    
    export let chatUser: ChatUserIF;
    $: chatUser;
    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

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
		target: chatUser._user_info.id,
		// Defines which side of your trigger the popup will appear
		placement: 'bottom',
	};

    function fn() {

    }

</script>

<!-- <ul class="list">
    
</ul> -->

<dl class="list-dl">
    <li>
        <span> </span>
        <span class="flex-auto"> </span>
    </li>
    <div class="cursor-pointer">
            <div class="flex-auto" >
                    <span>
                        <dt use:popup={popupFeatured}>
							<Avatar src={chatUser._user_info.avatar} width="w-7" rounded="rounded-full" />
							{chatUser._user_info.id} | {chatUser._user_info.nickname}
						</dt>
                    </span>
                    <span class="badge p-0">👑</span>
                    <span class="badge p-0">🗡️</span>
                    <span class="badge p-0">🔇</span>
            </div>
		</div>
	</dl>
	<ChatUserOptions {chatUser}/>
