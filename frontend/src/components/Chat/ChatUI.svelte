<script lang="ts">
    import { Avatar, ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
    import type { Socket } from 'socket.io-client'
    // dm인데 그대로 갈것인가?
    import { page } from '$app/stores'

    // Stores
	import { modalStore } from '@skeletonlabs/skeleton'
    import type { DmChatStoreIF, DmUserInfoIF, DmChatIF } from '$lib/interface';

    // export let parent : any
    export let dmChatStore: DmChatStoreIF;
    export let userInfo: UserDTO;
    let opponent : string = Object.keys(dmChatStore)[0];
    
    // api
    import { getApi } from '../../service/api';
	import { onMount } from 'svelte';
    
    onMount (async () => {
        try {
            // dmChatStore[opponent]._userInfo = await getApi({
            //     path: 'user/' + opponent,
            // });

        } catch (error )
        {
            alert('오류 : ' + opponent + ' user정보를 가져올 수 없습니다.');
            // await goto('/main');k
        }
    })

    let socket: Socket
    let userid: string
    let msg_list: ChatMsgIF[] = []
    let chat_data: ChatMsgIF = {
		_msg: '',
		_user_name: '',
		_room_name: $page.params['chat_room']
	}

    /* ================================================================================
                                chat msg
    ================================================================================ */
    // chat room에도 있어서 통합 필요. 별도 ts로 만들거나 등등

    function ft_chat_send_msg() {
		if (chat_data._msg.length && chat_data._msg != '\n')
			socket.emit('chat-msg-event', chat_data)
		chat_data._msg = ''
		console.log(userid)
	}

	function ft_chat_send_msg_keydown(e: KeyboardEvent) {
		if (e.keyCode != 13) return
		ft_chat_send_msg()
	}

    // Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';

    // chat 
    let currentMessage = '';
    let elemChat: HTMLElement;
    
    function scrollChatBottom(behavior?: ScrollBehavior): void {
        elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
    }

    function addMessage(): void {
		const newMessage : DmChatIF = {
            _from: userInfo.id,
            _to: opponent,
            _msg: currentMessage,
		};
		// Update the message feed
        // opponent data
		dmChatStore[opponent]._dmChatStore = [... dmChatStore[opponent]._dmChatStore, newMessage];
		// Clear prompt
		currentMessage = '';
		// Smooth scroll to bottom
		// Timeout prevents race condition
		setTimeout(() => {
			scrollChatBottom('smooth');
		}, 0);
	}

    function onPromptKeydown(event: KeyboardEvent): void {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			addMessage();
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
                    {#each dmChatStore[opponent]._dmChatStore as bubble}
                        {#if bubble._from === userInfo.id}
                            <div class="grid grid-cols-[auto_1fr] gap-2">
                                <Avatar src="{userInfo.avatar}" width="w-12" />
                                <div class="card p-4 variant-soft rounded-tl-none space-y-2">
                                    <header class="flex justify-between items-center">
                                        <p class="font-bold">{bubble._from}</p>
                                    </header>
                                    <p>{bubble._msg}</p>
                                </div>
                            </div>
                        {:else}
                            <div class="grid grid-cols-[1fr_auto] gap-2">
                                <div class="card p-4 rounded-tr-none space-y-2 variant-soft-primary">
                                    <header class="flex justify-between items-center">
                                        <p class="font-bold">{bubble._from}</p>
                                    </header>
                                    <p>{bubble._msg}</p>
                                </div>
                                <Avatar src="{dmChatStore[opponent]._userInfo.avatar}" width="w-12" />
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
                            on:keydown={onPromptKeydown}
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