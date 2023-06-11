<script lang="ts">
    import UserLayout from "../../components/Auth/UserLayout.svelte";
    import { auth } from '../../service/store';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation'
    import LoadingMessage from "../../components/Auth/LoadingMessage.svelte";
    import "../../service/userDTO";
    import "../../service/friendDTO"
    import { getApi } from "../../service/api";

    let userInfo : UserDTO;
    let isLoading : boolean = true;

    // 친구 불러오기 위함
    let friendList: friendDTO[] = [];


    onMount(async () => {
        try {
            userInfo = await auth.isLogin();
            if (!userInfo) {
                goto('/');
                throw("잘못된 접근");
            }

            friendList = await getApi({ path: 'friends' });
            isLoading = false;
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
    <UserLayout {userInfo} {friendList}/>
    <slot />
{/if}