<script lang="ts">
    import { Avatar, ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
    import type { ChatMsgIF } from '$lib/interface'
    import type { Socket } from 'socket.io-client'
    // dm인데 그대로 갈것인가?
    import { page } from '$app/stores'

    // Stores
	import { modalStore } from '@skeletonlabs/skeleton'

    export let parent : any

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


	// Types
	interface Person {
		id: number;
		avatar: number;
		name: string;
	}
	interface MessageFeed {
		id: number;
		host: boolean;
		avatar: number;
		name: string;
		timestamp: string;
		message: string;
		color: string;
	}

	// Navigation List
	const people: Person[] = [
		{ id: 0, avatar: 14, name: 'Michael' },
		{ id: 1, avatar: 40, name: 'Janet' },
		{ id: 2, avatar: 31, name: 'Susan' },
		{ id: 3, avatar: 56, name: 'Joey' },
		{ id: 4, avatar: 24, name: 'Lara' },
		{ id: 5, avatar: 9, name: 'Melissa' }
	];
	let currentPerson: Person = people[0];

    let messageFeed = [
        {
            id: 0,
            host: true,
            avatar: 48,
            name: 'Jane',
            timestamp: 'Yesterday @ 2:30pm',
            message: 'Some message text.',
            color: 'variant-soft-primary'
        },
        {
            id: 1,
            host: false,
            avatar: 14,
            name: 'Michael',
            timestamp: 'Yesterday @ 2:45pm',
            message: 'Some message text.',
            color: 'variant-soft-primary'
        }
    ];

	function getCurrentTimestamp(): string {
		return new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	}
    
    function scrollChatBottom(behavior?: ScrollBehavior): void {
        elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
    }

    function addMessage(): void {
		const newMessage = {
			id: messageFeed.length,
			host: true,
			avatar: 48,
			name: 'Jane',
			timestamp: `Today @ ${getCurrentTimestamp()}`,
			message: currentMessage,
			color: 'variant-soft-primary'
		};
		// Update the message feed
		messageFeed = [...messageFeed, newMessage];
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


{#if !($modalStore[0])}
<!-- Chat -->
<div class="grid grid-row-[1fr_auto]">
    <!-- Conversation -->
    <section bind:this={elemChat} class="max-h-[500px] p-4 overflow-y-auto space-y-4">
        {#each messageFeed as bubble}
            {#if bubble.host === true}
                <div class="grid grid-cols-[auto_1fr] gap-2">
                    <Avatar src="https://i.pravatar.cc/?img={bubble.avatar}" width="w-12" />
                    <div class="card p-4 variant-soft rounded-tl-none space-y-2">
                        <header class="flex justify-between items-center">
                            <p class="font-bold">{bubble.name}</p>
                            <small class="opacity-50">{bubble.timestamp}</small>
                        </header>
                        <p>{bubble.message}</p>
                    </div>
                </div>
            {:else}
                <div class="grid grid-cols-[1fr_auto] gap-2">
                    <div class="card p-4 rounded-tr-none space-y-2 {bubble.color}">
                        <header class="flex justify-between items-center">
                            <p class="font-bold">{bubble.name}</p>
                            <small class="opacity-50">{bubble.timestamp}</small>
                        </header>
                        <p>{bubble.message}</p>
                    </div>
                    <Avatar src="https://i.pravatar.cc/?img={bubble.avatar}" width="w-12" />
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
{:else}
    	<!-- Slot: Sandbox -->
		<section class="card">
			<div class="chat w-full h-full grid grid-cols-1 ">
				<!-- Navigation -->
				<!-- <div class="hidden lg:grid grid-rows-[auto_1fr_auto] border-r border-surface-500/30">
					<header class="border-b border-surface-500/30 p-4">
						<input class="input" type="search" placeholder="Search..." />
					</header>
					<div class="p-4 space-y-4 overflow-y-auto">
						<small class="opacity-50">Contacts</small>
						<ListBox active="variant-filled-primary">
							{#each people as person}
								<ListBoxItem bind:group={currentPerson} name="people" value={person}>
									<svelte:fragment slot="lead">
										<Avatar src="https://i.pravatar.cc/?img={person.avatar}" width="w-8" />
									</svelte:fragment>
									{person.name}
								</ListBoxItem>
							{/each}
						</ListBox>
					</div>
				</div> -->
				<!-- Chat -->
				<div class="grid grid-row-[1fr_auto]">
					<!-- Conversation -->
					<section bind:this={elemChat} class="max-h-[500px] p-4 overflow-y-auto space-y-4">
						{#each messageFeed as bubble}
							{#if bubble.host === true}
								<div class="grid grid-cols-[auto_1fr] gap-2">
									<Avatar src="https://i.pravatar.cc/?img={bubble.avatar}" width="w-12" />
									<div class="card p-4 variant-soft rounded-tl-none space-y-2">
										<header class="flex justify-between items-center">
											<p class="font-bold">{bubble.name}</p>
											<small class="opacity-50">{bubble.timestamp}</small>
										</header>
										<p>{bubble.message}</p>
									</div>
								</div>
							{:else}
								<div class="grid grid-cols-[1fr_auto] gap-2">
									<div class="card p-4 rounded-tr-none space-y-2 {bubble.color}">
										<header class="flex justify-between items-center">
											<p class="font-bold">{bubble.name}</p>
											<small class="opacity-50">{bubble.timestamp}</small>
										</header>
										<p>{bubble.message}</p>
									</div>
									<Avatar src="https://i.pravatar.cc/?img={bubble.avatar}" width="w-12" />
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
<!-- example -->
<!-- 
<div class="modal-example-form {cBase}">
    <form class="modal-form {cForm}">
        <label class="label">
            <span>대화방 이름</span>
            <input class="input" type="text" placeholder="대화방 이름" />
        </label>
        <label class="label">
            <span>대화방 비밀번호</span>
            <input class="input" type="tel" placeholder="대화방 비밀번호" />
        </label>
    </form>
    <footer class="modal-footer">
    <button class="btn {parent.buttonNeutral}">취소</button>
    <button class="btn {parent.buttonPositive}">대화방 입장</button>
</footer>
</div> -->

<!-- done example -->



<!-- <div class="bg-surface-500/30 p-4 modal-example-form {cBase}"> -->
    <!-- {#each msg_list as msg} -->
        <!-- {#if (msg._user_name == userid)} -->
            <!-- <div class="grid grid-cols-[auto_1fr] gap-5">
                <Avatar src="https://i.pravatar.cc/?img={'bubble.avatar'}" width="w-12" />
                <div class="card p-4 variant-soft rounded-tl-none space-y-2">
                    <header class="flex justify-between items-center">
                        <p class="font-bold">{"msg._user_name"}</p>
                    </header>
                    <p class="font-bold">{"msg._msg"}</p>
                </div>
            </div> -->
        <!-- {:else}
            <div class="grid grid-cols-[1fr_auto] gap-2">
                <div class="card p-4 rounded-tr-none space-y-2 {'bubble.color'}">
                    <header class="flex justify-between items-center">
                        <p class="font-bold">{ msg._user_name}</p>
                        <small class="opacity-50">{msg._user_name}</small>
                    </header>
                    <p class="font-bold">{msg._msg}</p>
                </div>
                <Avatar src="https://i.pravatar.cc/?img={'bubble.avatar'}" width="w-12" />
            </div>
        {/if} -->
    <!-- {/each} -->

    <!-- <div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
        <button class="input-group-shim">+</button>
        <textarea
            bind:value={chat_data._msg}
            on:keyup={ft_chat_send_msg_keydown}
            class="bg-transparent border-0 ring-0"
            name="prompt"
            id="prompt"
            placeholder="Write a message..."
            rows="1"
        />
        <button class="variant-filled-primary text_input_btn" on:click={ft_chat_send_msg}>Send</button>
    </div>
</div>
{/if} -->