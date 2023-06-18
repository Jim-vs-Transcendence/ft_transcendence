<script lang="ts">
    // import { ChatUserIF } from '$lib/interface.d'
    // export let chatUser: chatUserDTO;
    // export let userInfo: UserDTO;
    // $: chatUser;
    export let chatUser: ChatUserIF;
    $: chatUser;

    import { Avatar } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
    import { getApi, postApi, delApi } from '../../service/api';

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
</script>

<ul class="list">
    
    </ul>

<dl class="list-dl">
    <li>
        <span> </span>
        <span class="flex-auto"> </span>
    </li>
    <!-- ... -->
    <div>
        {#if !isRefused}
            <span class="flex-auto">
                <dt> <Avatar src={chatUser._user_info.avatar} on:click={() => goProfile(chatUser._user_info.id)} width="w-7" rounded="rounded-full" />  {chatUser._user_info.id} | {chatUser._user_info.nickname}  </dt>
            </span>
            <span class="badge p-0">👑</span>
            <!-- <span class="badge p-0">🗡️</span>
            <span class="badge p-0">🔇</span> -->
        {/if}
    </div>
    <!-- ... -->
</dl>
    
