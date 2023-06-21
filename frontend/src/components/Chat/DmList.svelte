<script lang="ts">
    import type { DmChatStoreIF } from '$lib/interface';

    // export let DmChatStore: DmChatStoreIF;
    // export let userInfo: UserDTO; // 실제로 api요청해서 데이터 가져올때 필요 
    // $: userInfo;

    import { Avatar } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
    import { getApi } from '../../service/api';

    /**
     * 실제로 api요청해서 데이터 가져올때 필요 
     */
    // async function getUserInfo(): Promise<void> {
    //     userInfo = await getApi({
    //         path: 'user/' + userInfo.id,
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

    // storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
    /*
        - dummy data 
    */
    const userInfo: UserDTO =
		{
            id: "jim",
            nickname: "nickname jim",
            avatar: "https://cdn.intra.42.fr/users/0deac2fad263069699a587baaf629266/jim.JPG",
            email: "email",
            level: 0,
            win: 0,
            lose: 0,
            two_factor: false,
            user_status: 0,
		};


</script>

<div>
    <Avatar
        src={userInfo.avatar}
        width="w-7"
        rounded="rounded-full"
        />
        <!-- on:click={() => goProfile(userInfo.id)} -->
    <span class="flex-auto">
        <dt>
            {userInfo.id}
        </dt>
    </span>
</div>
