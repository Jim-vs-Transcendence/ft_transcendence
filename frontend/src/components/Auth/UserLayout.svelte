<script lang="ts">
	import { goto } from '$app/navigation';
  import { authToken } from '../../service/store';
  import '../../service/userDTO';
  import '../../service/friendDTO';

  export let userInfo: UserDTO ;
  export let friendList: friendDTO[];

  //friendsList 컴포넌트
  import FriendsList from '../Profile/FriendsList.svelte';

  //css
  import { AppBar } from '@skeletonlabs/skeleton';
  import { Avatar } from '@skeletonlabs/skeleton';
  import { Drawer, drawerStore } from '@skeletonlabs/skeleton';
  import type { DrawerSettings } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

const logout = () => {
  authToken.logout()
};

const goProfile = (name: string) => {
  goto('profile/' + name)
};

const openDrawer = () => {
  drawerStore.open();
};

</script>

<!-- UserLayout.svelte -->
<Drawer
  width="w-64"
  position="right"
>

<!-- 친구 목록 : 옆으로 뜨는거 수정해야함 -->
<dl class="list-dl">
    {#each friendList as friend}
      <FriendsList friend={friend} userInfo={userInfo} />
    {/each}
</Drawer>

<!-- 상단바 -->
<AppBar slot="headline" class="h-16">

  <div slot="lead" class="flex items-center space-x-6">
    <!-- 로그아웃, 다크모드 -->
    <button on:click={logout}>기록 밖으로</button>
  </div>
  <h1 class="h1 text-center -mt-3">
    <!-- 메인 로고 -->
    <span class="text-3xl bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">Jim vs Transcendence</span>  
  </h1>
  <div slot="trail" class="flex items-center space-x-6">
    <!-- 아바타, 친구목록 -->
    <Avatar src={userInfo.avatar} on:click={ () => {goProfile(userInfo.id)}} width="w-8" rounded="rounded-full" style="cursor: pointer;" />    <button type="button" class="btn btn-sm variant-filled" on:click={openDrawer}>동무 목록</button>
  </div>
</AppBar>