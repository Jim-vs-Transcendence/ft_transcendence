<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	
	//임시
	interface UserDTO {
	    id: string;
	    nickname: string;
	    avatar: string;
	    email: string;
	    level: number;
	    win: number;
	    lose: number;
	    two_factor: boolean;
	    user_status: number;
	}

	// frontend/src/service/userDTO.ts
	export let userInfo : UserDTO;
	export let chatUser : UserDTO;
	export let msg_list : string[];
    let isMyself : boolean;
    // alert(chatUser.id);
	console.log("userInfo : " + userInfo);
    console.log("chatUser : " + chatUser);
    // console.log(userInfo);
    // console.log(userInfo.id);
    if (userInfo.id === chatUser.id) {
		isMyself = true;
	} else {
		isMyself = false;
	}
	// onMount(() => {
	// 	if (userInfo.id === chatUser.id) {
	// 		isMyself = true;
	// 	} else {
	// 		isMyself = false;
	// 	}
  	// });

</script>

<!-- msg_list에 id 추가해서 처리 가능할지 확인 필요 -->
<!-- {#if isMyself} -->
    <div class="grid grid-cols-[auto_1fr] gap-5">
        <Avatar src="https://i.pravatar.cc/?img={chatUser.avatar}" width="w-12" />
        <div class="card p-4 variant-soft rounded-tl-none space-y-2">
            <header class="flex justify-between items-center">
                <p class="font-bold">{chatUser.id}</p>
                <!-- <small class="opacity-50">{chatUser.timestamp}</small> -->
            </header>
            {#each msg_list as msg}
                <p class="font-bold"> {msg} </p>
            {/each}
        </div>
    </div>
<!-- {:else} -->
    <div class="grid grid-cols-[1fr_auto] gap-2">
        <div class="card p-4 rounded-tr-none space-y-2">
            <header class="flex justify-between items-center">
                <p class="font-bold"> {chatUser.id} </p>
                <!-- timestamp는 server에서  -->
                <!-- <small class="opacity-50">{chatUser.timestamp}</small> -->
            </header>
            {#each msg_list as msg}
                <p class="font-bold"> {msg} </p>
            {/each}
        </div>
        <Avatar src="https://i.pravatar.cc/?img={chatUser.avatar}" width="w-12" />
    </div>
<!-- {/if} -->


