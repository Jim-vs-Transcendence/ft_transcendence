<script lang="ts">
	import { onMount } from 'svelte/internal';
	import { auth } from '../../service/store';

	//임시: 유저 데이터 받아오는 곳
	import ShortChat from '../../components/Chat/ShortChat.svelte';

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

	let chatUser : UserDTO = {
		id: 'jinwooole',
		nickname: 'jinwoole',
		avatar: "",
		email: "",
		level: 0,
		win: 0,
		lose: 0,
		two_factor: false,
		user_status: 0,
	}

	import { getApi } from '../../service/api';
	let userInfo : UserDTO;
	onMount(async () => {
		try {
			userInfo = await auth.isLogin();
			console.log(userInfo);
			if (!userInfo) {
				throw("잘못된 접근");
			}
		}
		catch(error) {
			alert("잘못된 접근");
		}
	});

	let msg_list: string[] = [];

</script>



<ShortChat userInfo={userInfo} chatUser={chatUser} msg_list={msg_list}/>
<ShortChat userInfo={userInfo} chatUser={userInfo} msg_list={msg_list}/>

<!-- <div class="w-full h-full grid grid-cols-[auto_1fr] gap-1" style="height: calc(90% - 64px)">
	<div class="bg-surface-500/30 p-4">(nav)
	</div>
	<div class="bg-surface-500/30 p-4">
		


		<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
			<button class="input-group-shim">+</button>
			<textarea
				bind:value={chat_data._msg}
				on:keydown={ft_chat_send_msg_keydown}
				class="bg-transparent border-0 ring-0"
				name="prompt"
				id="prompt"
				placeholder="Write a message..."
				rows="1"
			/>
			<button class="variant-filled-primary text_input_btn" on:click={ft_chat_send_msg}>Send</button>
		</div>
		
	
	</div>
</div>
				 -->