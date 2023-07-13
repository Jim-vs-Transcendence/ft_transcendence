<script lang="ts">
	import { goto } from '$app/navigation';
  import { authToken } from '../../service/store';
  import '../../service/userDTO';
  import '../../service/friendDTO';

  export let userInfo: UserDTO ;
  export let friendList: friendDTO[];

  import FriendsList from '../Profile/FriendsList.svelte';

  import { AppBar } from '@skeletonlabs/skeleton';
  import { Avatar } from '@skeletonlabs/skeleton';
  import { Drawer, drawerStore } from '@skeletonlabs/skeleton';
  import { getApi } from '../../service/api';
  import { onMount, onDestroy } from 'svelte';

  import { TabGroup, Tab } from '@skeletonlabs/skeleton';

  import { Toast, toastStore } from '@skeletonlabs/skeleton';
  import type { ToastSettings } from '@skeletonlabs/skeleton';

	import DmList from '../Chat/DmList.svelte';

  const logout = () => {
    authToken.logout()
  };

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

  let tabSet: number = 0
  const updateFriend = async (): Promise<void> => {
    if (toggleRefresh)
    {
      friendList = await getApi({
            path: 'friends/',
        });
    }
  };

  let intervalId: NodeJS.Timer;

  export let startInterval = () => {
    intervalId = setInterval(() => {
    updateFriend();
    }, 1000);
  };

  export let stopInterval = () => {
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

let insertUserId: string = "";

function handleEnter(e: KeyboardEvent) {
    if (e.key === "Enter") {
        doSearch();
    }
}

function showToast() {
  const t: ToastSettings = {
    message: '존재하지 않는 유저입니다',
    hideDismiss: true,
    timeout: 3000
  };
  toastStore.trigger(t);
}

async function doSearch() {
    let answer : UserDTO | string;
    try {
            answer = await getApi({
                     path: 'user/' + insertUserId,
                    });
          if (answer === "")
            showToast();
          else
              goProfile(insertUserId);
        } catch (error) {
            console.log(error);
    }
}

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
      <!-- To be DM list component -->
      <DmList userInfo={userInfo} />
    {:else if tabSet === 1}
      <!-- Friend list -->
            <header class="card-footer  top-0 w-full">
                <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
                  <input type="search" placeholder="Search!!" bind:value={insertUserId} on:keydown={handleEnter} />
                </div>
            </header>
            <div class="overflow-y-scroll">
                <dl class="list-dl">
                {#each friendList as friend}
                    <FriendsList friend={friend} />
                {/each}
                </dl>
            </div>
    {/if}
  </svelte:fragment>
</TabGroup>

</Drawer>

<!-- 상단바 -->
<AppBar gridColumns="grid-cols-3" slotTrail="place-content-end" slot="headline" class="h-16">

  <div slot="lead" class="flex items-center space-x-6">
    <!-- 로그아웃, 다크모드 -->
    <button on:click={logout}>기록 밖으로</button>
  </div>
  <h1 class="h1 text-center -mt-3 col-span-3">
    <!-- 메인 로고 -->
    <span class="text-3xl bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">
      <span role="button" tabindex="0" on:click={goHome} on:keydown={event => event.key === 'Enter' && goHome()} style="cursor: alias;">Jim&nbsp;</span><!--
      --><span role="button" tabindex="0" on:click={goGame} on:keydown={event => event.key === 'Enter' && goGame()} style="cursor: progress;">vs</span><!--
      --><span role="button" tabindex="0" on:click={goHome} on:keydown={event => event.key === 'Enter' && goHome()} style="cursor: alias;">&nbsp;Transcendence</span>
    </span>
  </h1>
  <div slot="trail" class="flex items-center space-x-6">
    <!-- 아바타, 친구목록 -->
    <Avatar src={userInfo.avatar} on:click={ () => {goProfile(userInfo.id)}} width="w-8" rounded="rounded-full" style="cursor: pointer;" />
    <button type="button" class="btn btn-sm variant-filled" on:click={openDrawer}>동무 ! 목록</button>
  </div>
</AppBar>
<Toast max={5} buttonDismiss={'btn variant-filled'} buttonDismissLabel={'거절'} />
