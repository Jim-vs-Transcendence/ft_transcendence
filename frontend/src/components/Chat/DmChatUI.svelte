<script lang="ts">
    export let dmUserInfo: DmUserInfoIF
    export let userInfo: UserDTO
    export let opponent : string
    export let dmStoreData: DmChatStoreIF

    import { onMount } from 'svelte'
    import { Avatar } from '@skeletonlabs/skeleton'

    // Stores
	import { modalStore } from '@skeletonlabs/skeleton'
    import type { DmUserInfoIF, DmChatIF, DmChatStoreIF, ChatMsgIF } from '$lib/interface'
        
    // Socket
    import { DM_KEY, socketStore } from '$lib/webSocketConnection_chat';
	import type { Socket } from 'socket.io-client';
	import { onDestroy } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';

	let socket: Socket;
    
    let loadDmChat : string | null;
    
    const unsubscribe : Unsubscriber = socketStore.subscribe((_socket: Socket) => {
        socket = _socket;
	});

    onDestroy(() => {
        unsubscribe();
        if (socket !== undefined)
		{
			socket.off('dm-chat-to-ui');
		}
    });

    function dmDataLoad() {
        loadDmChat = localStorage.getItem(DM_KEY)
        if (loadDmChat) {
            dmStoreData = JSON.parse(loadDmChat)
            dmUserInfo = dmStoreData[opponent]
            setTimeout(() => {
			    scrollChatBottom('smooth')
		    }, 0)
        }
    }
    
    // 데이터 수신때 사용
    onMount(() => {
      try {
        dmDataLoad();

        socket.on("dm-chat-to-ui", (data: DmChatIF) => {
            try {
                if (data._from === dmUserInfo._userInfo.id)
                    dmUserInfo._dmChatStore = [...dmUserInfo._dmChatStore, data]
                setTimeout(() => {
                    scrollChatBottom('smooth')
                }, 0)
            }
            catch {
                alert('오류 : ' + data._from + ' user정보를 가져올 수 없습니다.') 
            }
        })
      } catch (error) {
        return alert('DM loading error')
      }
    })

    /* ================================================================================
                                chat interface
    ================================================================================ */
    let currentMessage = ''
    let elemChat: HTMLElement
    
    function scrollChatBottom(behavior?: ScrollBehavior): void {
        elemChat.scrollTo({ top: elemChat.scrollHeight, behavior })
    }

    async function addMessage(): Promise<void> {
        if (currentMessage.trim() === null)
            return 
		const newMessage : DmChatIF = {
            _from: userInfo.id,
            _to: opponent,
            _msg: currentMessage,
		}
		dmUserInfo._dmChatStore = [... dmUserInfo._dmChatStore, newMessage]
		// Clear prompt
		currentMessage = ''
        sendDm(newMessage)
		// Smooth scroll to bottom
		// Timeout prevents race condition
		setTimeout(() => {
			scrollChatBottom('smooth')
		}, 0)
	}

    function onPromptKeyPress(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
	  	  event.preventDefault()
        addMessage()
		}
	}

    /*
        동시에 여러 사용자와의DM으로 꼬일 일은 없다
        한번에 1명의 사용자와만 통신한다.
        고려해야할 것은
        나는 DM창을 안켰는데 상대방만 킨 경우 어떻게 되는가?
        socket이 연결 되는가?
        둘다 켜야지만 되는가?
    */
    // async
    function sendDm(dmChatData : DmChatIF)
    {
        try {
            dmStoreData[opponent]._dmChatStore = dmUserInfo._dmChatStore
            localStorage.setItem(DM_KEY, JSON.stringify(dmStoreData));
            if (dmChatData._msg.length && dmChatData._msg != '\n')
                socket.emit('dm-chat', dmChatData);
        }
        catch (error) {
            alert('오류: 상대방의 생사유무를 확인할 수 없습니다.')
        }
    }
</script>


{#if ($modalStore[0])}
    <!-- Slot: Sandbox -->
    <section class="card">
        <div class="chat w-full h-full grid grid-cols-1 ">
            <!-- Chat -->
            <div class="grid grid-row-[1fr_auto]">
                <!-- Conversation -->
                <section bind:this={elemChat} class="max-h-[500px] p-4 overflow-y-auto space-y-4">
                    {#each dmUserInfo._dmChatStore as bubble}
                        {#if bubble._from === userInfo.id}
                            <div class="grid grid-cols-[auto_1fr] gap-2">
                                <Avatar src="{userInfo.avatar}" width="w-12" />
                                <div class="card p-4 variant-soft rounded-tl-none space-y-2">
                                    <header class="flex justify-between items-center">
                                        <p class="font-bold">{bubble._from} | {userInfo.nickname} </p>
                                    </header>
                                    <p>{bubble._msg}</p>
                                </div>
                            </div>
                        {:else}
                            <div class="grid grid-cols-[1fr_auto] gap-2">
                                <div class="card p-4 rounded-tr-none space-y-2 variant-soft-primary">
                                    <header class="flex justify-between items-center">
                                        <p class="font-bold">{bubble._from} | {dmUserInfo._userInfo.nickname}</p>
                                    </header>
                                    <p>{bubble._msg}</p>
                                </div>
                                <Avatar src="{dmUserInfo._userInfo.avatar}" width="w-12" />
                            </div>
                        {/if}
                    {/each}
                </section>
                <!-- Prompt -->
                <section class="border-t border-surface-500/30 p-4">
                    <div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
                        <button class="input-group-shim">+</button>
                        <textarea
                            bind:value={currentMessage}
                            class="bg-transparent border-0 ring-0"
                            name="prompt"
                            id="prompt"
                            placeholder="Write a message..."
                            rows="1"
                            on:keypress={onPromptKeyPress}
                        />
                        <button class={currentMessage ? 'variant-filled-primary' : 'input-group-shim'} on:click={addMessage}>
                            <i class="fa-solid fa-paper-plane" />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    </section>
{/if}