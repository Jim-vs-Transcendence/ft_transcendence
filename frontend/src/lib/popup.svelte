<script lang="ts">
	export let property :popupIF = {
		_active: false, 
		_message: "", 
		_option: { 
			_password: "", 
			_index: 0,
			_room: {
				_room_name: "",
				_room_password: ""
			}
		}
	};
</script>

{#if property._active }
  <div style="position: fixed; width: 100%;  height: 100%; background: rgba(0, 0, 0, 0.8); top: 0; left: 0" on:mousedown|self>
    <div style="padding: 10px; border-radius: 10px; margin: 10%; background: white; ">
    <div style="text-align: center; padding: 10px" >{property._message}</div>
	  <slot></slot>
    </div>
  </div>
{/if}
