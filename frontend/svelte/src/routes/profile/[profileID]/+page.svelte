<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
	import { getApi } from '../../../service/api';
	import { auth, authToken } from '../../../service/store';
	import { goto } from '$app/navigation';
	import { Toast, toastStore } from '@skeletonlabs/skeleton';
    import type { ToastSettings } from '@skeletonlabs/skeleton';

    function errorToast() {
        const t: ToastSettings = {
            message: '잘못된 접근입니다',
            hideDismiss: true,
            timeout: 3000
        };
        toastStore.trigger(t);
    }

	const profileID = $page.params.profileID;

	import  '../../../service/userDTO';
	import  '../../../service/friendDTO';

	import LoadingMessage from '../../../components/Auth/LoadingMessage.svelte';
	import UserProfile from '../../../components/Profile/UserProfile.svelte';
	import MatchHistory from '../../../components/Profile/MatchHistory.svelte';

	//1. 서버에 profileID인 유저가 있는지 확인 및 본인인지 확인하고 정보 받아야 함
	// 1.5 받아올 정보는 2개 1. 유저정보 2. 게임 히스토리
	//2. 없는 유저면(아마 catch로 가겠지?) 메인으로 보내버리고,
	//3. 본인이면 투팩터 옵션, 본인 아니면 친구 관련 버튼 보이게

	let isLoading: boolean = true;
	let userInfo : UserDTO;
	let twoFactor = false;
	let isMyself = false;
	let isFriend : boolean = false;

	let profile_info : UserDTO;
	let profile_path : string;
	let friendList : friendDTO[];

	import { petchApi } from '../../../service/api';

	async function handleBeforeUnload() {
		try {
			await petchApi({
				path: 'user/status/' + userInfo.id,
				data: {
					"user_status": 0,
				}
			});
		} catch {

		}
	}

	onMount(async (): Promise<any> => {

		try{
			//1. token기반
			userInfo = await auth.isLogin();
			//2. target user profile / isMyself가 false라면,
			profile_path = 'user/' + profileID;
			profile_info = await getApi({ path: profile_path });

			//만약 본인 프로필에 들어갔다면
			if (userInfo.id === profileID) {
				isMyself = true;
				twoFactor = userInfo.two_factor;
			}
			else
			{
				const friendList : friendDTO[] = await getApi({ path: 'friends' });
				const found = friendList.find((friend) => friend.id.includes(profileID));
				if (found) {
					if (found.friendStatus === 'accepted')
						isFriend = true;
				}
				else {
					isFriend = false;
				}
			}
			isLoading = false;
			window.addEventListener('beforeunload', handleBeforeUnload);
			return () => {
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		}
		catch(error){
			errorToast();
			goto('/');
		}
	});
</script>

{#if isLoading === true}
	<LoadingMessage />
{:else}

<div class="flex align-top">
	  <div class="flex-1">
		<UserProfile {profile_info} {isMyself} {isFriend} />
	  </div>
	  <div class="flex-1">
		<MatchHistory {profile_info}/>
	  </div>
</div>
<Toast max={5} buttonDismiss={'btn variant-filled'} buttonDismissLabel={'거절'} />
{/if}
