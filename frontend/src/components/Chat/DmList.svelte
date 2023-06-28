<script lang="ts">
    import type { DmChatStoreIF, DmUserInfoIF } from '$lib/interface';

    export let userInfo: UserDTO;
    import { dmDummyList } from '../Auth/dmDummy';
    import { getApi } from '../../service/api';

	import DmUser from './DmUser.svelte';
	import { DM_KEY } from '$lib/webSocketConnection_chat';


    /*
    async () => {
        try {
            // dmChatStore[opponent]._userInfo = await getApi({
            //     path: 'user/' + opponent,
            // });

        } catch (error )
        {
            alert('오류 : ' + opponent + ' user정보를 가져올 수 없습니다.');
            // await goto('/main');k
        }
    }
    api요청해서 찾고자하는 유저가 있는지 검색한다.
    */

    let opponentUserId = '';
    let loadDmChat : string | null = localStorage.getItem(DM_KEY)
    $: loadDmChat

    function ftUpdateChatLocalStorage(newDmChatStore : DmUserInfoIF) {
        let dmData : DmChatStoreIF = {};
        if (loadDmChat)
            dmData = JSON.parse(loadDmChat);
        dmData[opponentUserId] = newDmChatStore; // deep copy가 될것인가? 혹시 꼬일 부분은 없는가?
        localStorage.setItem(DM_KEY, JSON.stringify(dmData));
    }

    async function ftDmSearch(): Promise<void> {
        try {
            opponentUserId = opponentUserId.trim()
            if (!(opponentUserId)) {
            return alert('찾고자하는 user를 입력하세요')
            }
            // TODO 이미 추가된 유저인지 확인 필요
            // else if () {

            // }
            let newDmChatStore : DmUserInfoIF = {
                _userInfo: await getApi({ path: 'user/' + opponentUserId}),
                _dmChatStore: [],
            }
            ftUpdateChatLocalStorage(newDmChatStore);
        } catch (error )
        {
            alert('오류 : ' + opponentUserId + ' user정보를 가져올 수 없습니다.');
        }
    }

</script>

<div>
    <!-- search -->
    <header class="card-footer  top-0 w-full">
      <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
        <input type="search" placeholder="Search!!" bind:value={opponentUserId} on:keydown={ftDmSearch} />
        <button type="button" class="variant-filled-surface" on:click={ftDmSearch}>Add</button>
      </div>
    </header>
    <!-- DM list -->
    <main>
      <div class="overflow-y-scroll">
        <dl class="list-dl">
          <!-- dummy -->
          {#each Object.entries(dmDummyList) as [key, curDmChatStore]}
            <DmUser dmUserInfo={curDmChatStore} userInfo={userInfo}/>
          {/each}
          <!-- real -->
          <!-- {#each Object.entries(dmDummyList) as [key, curDmChatStore]}
            <DmUser dmUserInfo={curDmChatStore} userInfo={userInfo}/>
          {/each} -->
        </dl>
      </div>
    </main>
  </div>