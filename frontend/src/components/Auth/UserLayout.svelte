<script lang="ts">
	import { goto } from '$app/navigation';
  import { authToken } from '../../service/store';
  import '../../service/userDTO';
  import '../../service/friendDTO';

  export let userInfo: UserDTO ;
  export let friendList: friendDTO[];

  //friendsList component
  import FriendsList from '../Profile/FriendsList.svelte';

  //css
  import { AppBar } from '@skeletonlabs/skeleton';
  import { Avatar } from '@skeletonlabs/skeleton';
  import { Drawer, drawerStore } from '@skeletonlabs/skeleton';
  import { getApi } from '../../service/api';
  import { onMount, onDestroy } from 'svelte';

  // tab
  import { TabGroup, Tab } from '@skeletonlabs/skeleton';

  //DM component
  import DmUser from '../Chat/DmUser.svelte';
  // DM dummy
  import { dmDummyList } from '../Auth/dmDummy';

  // Autocomplete
  import { Autocomplete } from '@skeletonlabs/skeleton';
  import type { AutocompleteOption } from '@skeletonlabs/skeleton';

  const logout = () => {
    authToken.logout()
  };

  //상대경로가 아닌 절대경로 프로필로 이동하도록 설정
  const goProfile = (name: string) => {
    goto('/profile/' + name, { replaceState: true });
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

  let tabSet: numbdmstore
  const updateFriend = async (): Promise<void> => {
      if (toggleRefresh)
    {
      friendList = await getApi({
            path: 'friends/',
        });
      console.log("done");
    }
  };

  let intervalId: NodeJS.Timer;

  const startInterval = () => {
    intervalId = setInterval(() => {
    updateFriend();
    }, 5000);
  };

  const stopInterval = () => {
    clearInterval(intervalId);
  };

  onMount(() => {
    startInterval();
  });

  onDestroy(() => {
    stopInterval();
  });

  let toggleRefresh: boolean = false;

  drawerStore.subscribe((state) => {
    if (state.open) {
      toggleRefresh = true;
    } else {
      toggleRefresh = false;
    }
  });

</script>

<!-- UserLayout.svelte -->
<Drawer
  width="w-64"
  position="right"
>

<TabGroup>
  <Tab bind:group={tabSet} name="tab2" value={0} class="max-h-[80%] overflow-y-auto">(DM)</Tab>
  <Tab bind:group={tabSet} name="tab1" value={1}>(동무목록)</Tab>
  <!-- Tab Panels --->
  <svelte:fragment slot="panel">
    {#if tabSet === 0}
      <div>
        <header class="card-footer  top-0 w-full">
          <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
            <input type="search" placeholder="Search..." />
            <button type="button" class="variant-filled-surface">Add</button>
          </div>
        </header>
        <main>
          <div class="overflow-y-scroll">
            <dl class="list-dl">
              {#each dmDummyList as dmUser}
                <DmUser dmChatStore={dmUser} userInfo={userInfo}/>
              {/each}
            </dl>
          </div>
        </main>
      </div>
    {:else if tabSet === 1}
        <dl class="list-dl">
          {#each friendList as friend}
            <FriendsList friend={friend} userInfo={userInfo} />
          {/each}
        </dl>
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
    <h1 class="h1 text-center -mt-3 col-span-3">
      <!-- 메인 로고 -->
      <span class="text-3xl bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">
          <span on:click={goHome} style="cursor: alias;">Jim&nbsp;</span><!--
          --><span on:click={goGame} style="cursor: progress;">vs</span><!--
          --><span on:click={goHome} style="cursor: alias;">&nbsp;Transcendence</span>
      </span>
    </h1>
  <div slot="trail" class="flex items-center space-x-6">
    <!-- 아바타, 친구목록 -->
    <Avatar src={userInfo.avatar} on:click={ () => {goProfile(userInfo.id)}} width="w-8" rounded="rounded-full" style="cursor: pointer;" />
    <button type="button" class="btn btn-sm variant-filled" on:click={openDrawer}>동무 ! 목록</button>
  </div>
</AppBar>
