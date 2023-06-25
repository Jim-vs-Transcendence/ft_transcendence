<script lang="ts">
    import UserLayout from "../../components/Auth/UserLayout.svelte";
    import { auth, authToken } from '../../service/store';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation'
    import LoadingMessage from "../../components/Auth/LoadingMessage.svelte";
    import "../../service/userDTO";
    import "../../service/friendDTO"
    import { getApi, petchApi } from "../../service/api";

    let userInfo : UserDTO;
    let isLoading : boolean = true;

    // 친구 불러오기 위함
    let friendList: friendDTO[] = [];

	async function handleBeforeUnload() {
	        await petchApi({
	            path: 'user/status/' + userInfo.id,
	            data: {
					"user_status": 0,
				}
        	});
	}

    onMount(async () => {
        try {
            userInfo = await auth.isLogin();
            if (!userInfo) {
                goto('/');
                throw("잘못된 접근");
            }

            await petchApi({
					path: 'user/status/' + userInfo.id,
					data: {
					"user_status": 1,
				}
			});

            friendList = await getApi({ path: 'friends' });
            isLoading = false;
            window.addEventListener('beforeunload', handleBeforeUnload);
			return () => {
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
        }
        catch(error) {
            alert("잘못된 접근");
            goto('/');
        }
    });
</script>

{#if isLoading === true}
    <LoadingMessage />
{:else}
    <!-- tab -->
        <UserLayout {userInfo} {friendList}/>
        <!-- DmUser
        <Dmchat  -->
    <slot />
{/if}
