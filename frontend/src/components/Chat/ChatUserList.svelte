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

{#if !isRefused}
    <div>
    <Avatar src={chatUser._user_info.avatar} on:click={() => goProfile(chatUser._user_info.id)} width="w-7" rounded="rounded-full" />
    <!-- <span class="flex-auto">
        <dt>{chatUser._user_info.id}</dt>
        {#if chatUser._user_info.chatUserStatus === chatUserRequestStatus.PENDING}
            <dd>친구신청 수락?</dd>
            <button class="btn-icon" on:click={acceptchatUser}>
                &#10003;
            </button>
            <button class="btn-icon" style="font-size: 19px" on:click={nochatUser}>
                &#10005;
            </button>
        {:else}
            <dd>대기중 아닌거</dd>
        {/if}

    </span> -->
    </div>
{/if}