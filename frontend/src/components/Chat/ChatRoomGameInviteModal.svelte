<script lang="ts">
	// Stores
	import { modalStore } from '@skeletonlabs/skeleton';
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;

	// Form Data
	// let room_passwd : string;
	// We've created a custom submit function to pass the response and close the modal.
	function onRoomDataSubmit(): void {
		if ($modalStore[0].response)
			$modalStore[0].response();
		modalStore.close();
	}
	// Base Classes
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

<!-- @component This example creates a simple form modal. -->
{#if $modalStore[0]}
	<div class="modal-example-form {cForm}">
		<button class="btn {parent.buttonPositive}" on:click={onRoomDataSubmit}>게임 수락</button>
		<button class="btn {parent.buttonNeutral}" on:click={modalStore.close}>취소</button>
	</div>
{/if}