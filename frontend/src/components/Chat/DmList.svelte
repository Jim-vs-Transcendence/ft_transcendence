<script lang="ts">
  export let userInfo: UserDTO

  import { onMount, onDestroy } from 'svelte';

  import type { DmChatStoreIF, DmUserInfoIF } from '$lib/interface'
  import DmUser from './DmUser.svelte'
  import { DM_KEY } from '$lib/webSocketConnection_chat'
  import { getApi } from '../../service/api'
  // Autocomplete for search
  // import { Autocomplete } from '@skeletonlabs/skeleton'
  // import type { AutocompleteOption } from '@skeletonlabs/skeleton'

  let opponentUserId= ''
  let loadDmChat : string | null
  $: loadDmChat // OnMount할때 하면 굳이 반응형 변수로 할 필요 없는가?
  // 컴포넌트가 DOM에 마운트될 때이니 굳이 인가?
  let dmStoreData : DmChatStoreIF = {}
  $: dmStoreData
  /*
      - await 참고용
      - 1.
          const updateFriend = async (): Promise<void> => {
              if (toggleRefresh)
              {
              friendList = await getApi({
                      path: 'friends/',
                  })
              console.log("done")
              }
          }
      - 2.
          onMount (async () => {
              try {
                  // dmChatStore[opponent]._userInfo = await getApi({
                  //     path: 'user/' + opponent,
                  // })

              } catch (error )
              {
                  alert('오류 : ' + opponent + ' user정보를 가져올 수 없습니다.')
                  // await goto('/main')k
              }
          })
  */

  /**
   * dmStore에 있는 모든 유저들의 userInfo를 최신화 한다.
   * getApi로 각 유저의 userInfo를 가져온 뒤 덮어쓰게 한다
   * 더욱 나은 방법은 getApi userInfo를 가져온 뒤 바뀐 부분이 있는지 비교하여 해당 부분만 바꾼다.
   * 또한 DM list에 있는 유저를 한정적으로 가져간다.
   */
  function ft_update_dm_list()  {

  }
  // await가 필요한 케이스인가?, 함수호출에만 쓰는가?
  // 브라우저 local storage에서 바로 가져오니 필요 없는가?
  // 이미 이 순간에 업데이트 하게 한다.
  // tab이 선택되는 순간에 mount되는것인가?
  onMount(async () => {
      try {
        loadDmChat = localStorage.getItem(DM_KEY)
        if (loadDmChat)
          dmStoreData = JSON.parse(loadDmChat)
        
      } catch (error) {
        console.log('DM loading error')
      }
  })

  /*
      setItem으로 추가되는 내부로직은 어떻게 되는가
      그냥 덮여쓰여지는가?
      성능상의 이슈는 없는가?
  */
  function ftUpdateChatLocalStorage(newDmChatStore : DmUserInfoIF) {
      // let dmData : DmChatStoreIF = {}
      // if (loadDmChat)
      //     dmData = JSON.parse(loadDmChat)
      // console.log("============= ftUpdateChatLocalStorage =============")
      // console.log("opponentUserId : " + opponentUserId)
      // console.log("before assign dmStoreData : ")
      // console.log(dmStoreData)
      // console.log("newDmChatStore : ")
      // console.log(newDmChatStore)
      dmStoreData[opponentUserId] = newDmChatStore // deep copy가 될것인가? 혹시 꼬일 부분은 없는가?
      // console.log("after assign dmStoreData : ")
      // console.log(dmStoreData)
      // console.log("dmStoreData[opponentUserId] : ")
      // console.log(dmStoreData[opponentUserId])
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
        // TODO 이미 추가된 유저인지 확인 필요
        // else if () {
          
        // }
        // getApi()로 받아온 것을 바로 할당하는 것이 가능할 것인가?
        
        console.log("opponentUserId : " + opponentUserId)
        let searchedUser : UserDTO | null = await getApi({ path: 'user/' + opponentUserId})
        // console.log(typeof true);
        // || searchedUser === undefined
        if (typeof searchedUser === "string" || searchedUser === null || searchedUser === undefined)
        {
          console.log("searchedUser : ")
          console.log(searchedUser)
          return alert(opponentUserId + ' user정보 찾을 수 없습니다')
        }
        let newDmChatStore : DmUserInfoIF = {
            _userInfo: searchedUser,
            _dmChatStore: [],
        }
        ftUpdateChatLocalStorage(newDmChatStore)
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
              <DmUser opponent={key} dmUserInfo={curDmChatStore} userInfo={userInfo} />
            {/each}
          {/if}
        </dl>
      </div>
    </main>
  </div>