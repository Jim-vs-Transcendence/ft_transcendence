<script lang="ts">
	import { goto } from '$app/navigation';
  import { authToken } from '../../service/store';
  import '../../service/userDTO';
  import '../../service/friendDTO';
  import type { ChatUserIF }  from '$lib/interface';

  export let userInfo: UserDTO ;
  export let friendList: friendDTO[];
  export let chatUserList: ChatUserIF[];

  //friendsList component
  import FriendsList from '../Profile/FriendsList.svelte';

  //css
  import { AppBar } from '@skeletonlabs/skeleton';
  import { Avatar } from '@skeletonlabs/skeleton';
  import { Drawer, drawerStore } from '@skeletonlabs/skeleton';
  import type { DrawerSettings } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  // tab
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';

  //DM component
  import DmList from '../Chat/DmList.svelte';

const logout = () => {
  authToken.logout()
};

const goProfile = (name: string) => {
  goto('profile/' + name)
};

const goHome = () => {
        goto('/main');
    }

const goGame = () => {
    goto('/game');
}

const openDrawer = () => {
  drawerStore.open();
};

let tabSet: number = 0;
</script>

<!-- UserLayout.svelte -->
<Drawer
  width="w-64"
  position="right"
>

<!-- 친구 목록 : 옆으로 뜨는거 수정해야함 -->
<!-- <dl class="list-dl">
    {#each friendList as friend}
      <FriendsList friend={friend} userInfo={userInfo} />
    {/each}
</dl> -->
<TabGroup>
  <Tab bind:group={tabSet} name="tab1" value={0}>(동무목록)</Tab>
  <Tab bind:group={tabSet} name="tab2" value={1}>(DM)</Tab>
  <!-- Tab Panels --->
  <svelte:fragment slot="panel">
    {#if tabSet === 0}
      {#each friendList as friend}
        <dl class="list-dl">
          {#each friendList as friend}
            <FriendsList friend={friend} userInfo={userInfo} />
          {/each}
        </dl>
      {/each}
    {:else if tabSet === 1}
      <div>
        <div class="overflow-y-scroll">
          <dl class="list-dl">
            <!-- {#each chatUserList as chatUser} -->
            {#each [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9] as num}
              <DmList />
            {/each}
            <!-- <DmList chatUser={chatUser}/> -->
            <!-- {/each} -->
          </dl>
        </div>
        <div>
          <footer class="card-footer fixed bottom-0 w-full">(footer)</footer>
        </div>
      </div>
    
    {/if}
  </svelte:fragment>
</TabGroup>
    
</Drawer>

<!-- 상단바 -->
<AppBar slot="headline" class="h-16">

  <div slot="lead" class="flex items-center space-x-6">
    <!-- 로그아웃, 다크모드 -->
    <button on:click={logout}>기록 밖으로</button>
  </div>
  <h1 class="h1 text-center -mt-3">
    <!-- 메인 로고 -->
    <span class="text-3xl bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">
      <span on:click={goHome}>Jim </span>
      <span on:click={goGame}>vs</span>
      <span on:click={goHome}>Transcendence</span>
    </span>
  </h1>
  <div slot="trail" class="flex items-center space-x-6">
    <!-- 아바타, 친구목록 -->
    <Avatar src={userInfo.avatar} on:click={ () => {goProfile(userInfo.id)}} width="w-8" rounded="rounded-full" style="cursor: pointer;" />    <button type="button" class="btn btn-sm variant-filled" on:click={openDrawer}>동무 | 목록</button>
  </div>
</AppBar>
