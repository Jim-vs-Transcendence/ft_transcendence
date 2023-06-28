<script lang="ts">
    export let userInfo: UserDTO

    import type { DmChatStoreIF, DmUserInfoIF } from '$lib/interface'
	import DmUser from './DmUser.svelte'
	import { DM_KEY } from '$lib/webSocketConnection_chat'
    import { dmDummyList } from '../Auth/dmDummy'
    
    import { getApi } from '../../service/api'
    // Autocomplete for search
    // import { Autocomplete } from '@skeletonlabs/skeleton'
    // import type { AutocompleteOption } from '@skeletonlabs/skeleton'

    let opponentUserId = ''
    let loadDmChat : string | null
    // $: loadDmChat // OnMount할때 하면 굳이 반응형 변수로 할 필요 없는가?
    // 컴포넌트가 DOM에 마운트될 때이니 굳이 인가?
    let dmStoreData : DmChatStoreIF
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
    // await가 필요한 케이스인가?, 함수호출에만 쓰는가?
    // 브라우저 local storage에서 바로 가져오니 필요 없는가?
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
        dmStoreData[opponentUserId] = newDmChatStore // deep copy가 될것인가? 혹시 꼬일 부분은 없는가?
        localStorage.setItem(DM_KEY, JSON.stringify(dmStoreData))
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
            // getApi()로 받아온 것을 바로 할당하는 것이 가능할 것인가?
            let newDmChatStore : DmUserInfoIF = {
                _userInfo: await getApi({ path: 'user/' + opponentUserId}),
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
            <DmUser opponent={key} dmUserInfo={curDmChatStore} userInfo={userInfo}/>
          {/each}
          <!-- real -->
          <!-- {#each Object.entries(dmDummyList) as [key, curDmChatStore]}
            <DmUser dmUserInfo={curDmChatStore} userInfo={userInfo}/>
          {/each} -->
        </dl>
      </div>
    </main>
  </div>