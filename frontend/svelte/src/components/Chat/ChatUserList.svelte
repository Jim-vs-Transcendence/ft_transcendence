<script lang="ts">
	import { popup } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { Avatar } from '@skeletonlabs/skeleton';
	import { Authority } from '$lib/enum';
	import type { ChatUserIF } from '$lib/interface';
	import ChatUserOptions from './ChatUserOptions.svelte';

	export let chatUser: ChatUserIF;
	export let user_self: ChatUserIF;
	export let userid_list: string;
	export let channel_name: string;

	$: chatUser;

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	const popupFeatured: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: chatUser._user_info.id,
		// Defines which side of your trigger the popup will appear
		placement: 'bottom'
	};

</script>

<dl class="list-dl">
	<li>
		<span />
		<span class="flex-auto" />
	</li>
	<div class="cursor-pointer">
		<div class="flex-auto">
			<span>
				<dt use:popup={popupFeatured}>
					<Avatar src={chatUser._user_info.avatar} width="w-7" rounded="rounded-full" />
					{userid_list} | {chatUser._user_info.nickname}
				</dt>
			</span>
			{#if chatUser._authority === Authority.OWNER}
				<span class="badge p-0">👑</span>
			{:else if chatUser._authority === Authority.ADMIN}
				<span class="badge p-0">🗡️</span>
			{/if}
			{#if chatUser._is_muted}
				<span class="badge p-0">🔇</span>
			{/if}
		</div>
	</div>
</dl>
<ChatUserOptions {user_self} {chatUser} {channel_name} />