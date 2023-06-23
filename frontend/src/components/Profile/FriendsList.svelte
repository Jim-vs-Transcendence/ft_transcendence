<script lang="ts">
    export let friend: friendDTO;
    export let userInfo: UserDTO;
    $: friend;

    import { Avatar } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
    import { getApi, postApi, delApi } from '../../service/api';

    enum FriendRequestStatus {
        BLOCKED = 'blocked',
        PENDING = 'pending',
        ACCEPTED = 'accepted',
    }

    enum UserStatus {
        OFFLINE = 0,
        ONLINE,
        GAMING,
        CHATING,
    }

    let isRefused = false;

    const goProfile = (name: string) => {
        goto('profile/' + name)
    };

    async function acceptFriend(): Promise<void> {
        await postApi({
            path: 'friends/requests/' + friend.id + '/accept',
            data: {}
        });
        friend = await getApi({
            path: 'friends/' + friend.id,
        });
    }

    async function noFriend(): Promise<void> {
        await delApi({
            path: 'friends/requests/' + friend.id,
            data: {}
        });
        isRefused = true;
    }

    //프로필 팝업
    import { storePopup } from '@skeletonlabs/skeleton';
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { onDestroy } from 'svelte';

    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

    let intervalId: number;

	onDestroy(() => {
		clearInterval(intervalId);
	});
</script>

{#if !isRefused}
    {#if friend.friendStatus !== FriendRequestStatus.BLOCKED}
    <div>
    <Avatar
        src={friend.avatar}
        on:click={() => goProfile(friend.id)}
        width="w-7"
        rounded="rounded-full"
    />
    <span class="flex-auto">
        <dt>
            {friend.id + " | " + friend.nickname}
            {#if friend.status === UserStatus.OFFLINE}
                &#9675;
            {:else if friend.status === UserStatus.ONLINE}
                &#128994;
            {:else if friend.status === UserStatus.GAMING}
                gaming &#128308;
            {:else if friend.status === UserStatus.CHATING}
                chating &#128308;
            {/if}
        </dt>
        {#if friend.friendStatus === FriendRequestStatus.PENDING}
            <dd>친구신청 수락?</dd>
            <button class="btn-icon" on:click={acceptFriend}>
                &#10003;
            </button>
            <button class="btn-icon" style="font-size: 19px" on:click={noFriend}>
                &#10005;
            </button>
        {/if}
    </span>
    
    </div>
    {/if}
{/if}
