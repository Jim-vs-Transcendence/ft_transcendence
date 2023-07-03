<script lang="ts">
  export let userInfo: UserDTO

  import { onMount } from 'svelte'
  import type { DmChatStoreIF, DmUserInfoIF } from '$lib/interface'
  import DmUser from './DmUser.svelte'
  import { DM_KEY } from '$lib/webSocketConnection_chat';
  import { getApi } from '../../service/api'

  let opponentUserId= ''
  let loadDmChat : string | null
  let dmStoreData : DmChatStoreIF = {}
  $: dmStoreData

  async function ftUpdateDmList(): Promise<void> {
    try {
      for (const key of Object.keys(dmStoreData)) {
        const curUserInfo: UserDTO | null = await getApi({ path: 'user/' + key })
        dmStoreData[key]._userInfo = curUserInfo
        let newDmChatStore : DmUserInfoIF = {
          _userInfo: curUserInfo,
          _dmChatStore: dmStoreData[key]._dmChatStore,
        }
        await ftUpdateChatLocalStorage(key, newDmChatStore)
      }
    } catch (error) {
      alert('오류: 사용자 정보를 가져올 수 없습니다.')
    }
  }

  onMount(async () => {
      try {
        loadDmChat = localStorage.getItem(DM_KEY)
        if (loadDmChat) {
          dmStoreData = JSON.parse(loadDmChat)
          ftUpdateDmList()
        }
      } catch (error) {
        return alert('DM list loading error')
      }
  })

  async function ftUpdateChatLocalStorage(userId: string, newDmChatStore : DmUserInfoIF) {
    let curloadDmChat  : string | null = localStorage.getItem(DM_KEY)
    
    let curDmStoreData : DmChatStoreIF
    if (curloadDmChat) {
      curDmStoreData = JSON.parse(curloadDmChat)
      if (curDmStoreData[userId])
        newDmChatStore._dmChatStore = curDmStoreData[userId]._dmChatStore
    }
    console.log("ftUpdateChatLocalStorage")
    dmStoreData[userId] = newDmChatStore
    localStorage.setItem(DM_KEY, JSON.stringify(dmStoreData))
  }

  async function ftDmSearchKeyDown(event: KeyboardEvent): Promise<void> {
    if (['Enter'].includes(event.code)) {
      event.preventDefault()
      ftDmSearch()
    }
  }

  async function ftDmSearch(): Promise<void> {
      try {
        opponentUserId = opponentUserId.trim()
        if (!(opponentUserId)) {
          opponentUserId = ''
          return alert('찾고자하는 user를 입력하세요')
        }
        else if (opponentUserId === userInfo.id) {
          return alert('DM 대상으로 자신을 추가할 수는 없습니다.')
        }
        else if (opponentUserId in dmStoreData) {
          return alert('이미 ' + opponentUserId + '은(는) DM 대상으로 등록되었습니다.')
        }
        let searchedUser : UserDTO | null = await getApi({ path: 'user/' + opponentUserId})
        if (typeof searchedUser === "string" || searchedUser === null || searchedUser === undefined)
          return alert(opponentUserId + ' user정보 찾을 수 없습니다')
        let newDmChatStore : DmUserInfoIF = {
            _userInfo: searchedUser,
            _dmChatStore: [],
        }
        await ftUpdateChatLocalStorage(opponentUserId, newDmChatStore)
      } catch (error )
      {
          alert('오류 : ' + opponentUserId + ' user정보를 가져올 수 없습니다.')
      }
  }

</script>

<div>
    <!-- search -->
    <header class="card-footer  top-0 w-full">
      <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
        <input type="search" placeholder="Search!!" bind:value={opponentUserId} on:keydown={ftDmSearchKeyDown} />
        <button type="button" class="variant-filled-surface" on:click={ftDmSearch}>Add</button>
      </div>
    </header>
    <!-- DM list -->
    <main>
      <div class="overflow-y-scroll">
        <dl class="list-dl">
          {#if dmStoreData != null}
            {#each Object.entries(dmStoreData) as [key, curDmChatStore]}
              <DmUser opponent={key} dmUserInfo={curDmChatStore} userInfo={userInfo} dmStoreData={dmStoreData} />
            {/each}
          {/if}
        </dl>
      </div>
    </main>
  </div>