<script lang="ts">
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

    export let dmUserInfo: DmUserInfoIF
    export let userInfo: UserDTO
    export let opponent : string
    export let dmStoreData: DmChatStoreIF

	let socket: Socket;
    
    let loadDmChat : string | null;
    
    const unsubscribe : Unsubscriber = socketStore.subscribe((_socket: Socket) => {
        socket = _socket;
	});

    onMount(() => {
      try {
        dmDataLoad();
        socket.on("dm-chat", (data: DmChatIF) => {
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

    onDestroy(() => {
        console.log("onDestroy() in DmChatUI.svelte");
        unsubscribe();
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

    /* ================================================================================
                                chat interface
    ================================================================================ */
    let currentMessage = ''
    let elemChat: HTMLElement
    
    function scrollChatBottom(behavior?: ScrollBehavior): void {
        elemChat.scrollTo({ top: elemChat.scrollHeight, behavior })
    }

    async function addMessage(): Promise<void> {
        currentMessage = currentMessage.trim()
        if (!(currentMessage))
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

    function sendDm(dmChatData : DmChatIF)
    {
        try {
            dmStoreData[opponent]._dmChatStore = dmUserInfo._dmChatStore
            localStorage.setItem(DM_KEY, JSON.stringify(dmStoreData));
            if (dmChatData._msg.length && dmChatData._msg != '\n')
                socket.emit('dm-chat', dmChatData);
        }
        catch (error) {
            console.log(error)
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
