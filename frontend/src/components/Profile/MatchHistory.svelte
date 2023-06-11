<script lang="ts">
    export let profile_info: UserDTO;
</script>

<!-- two-factor 혹은 친구 -->
<div class="grid">	
    <li class="text-lg font-bold">승 : {profile_info.win}</li>
    <li class="text-lg font-bold">패 : {profile_info.lose}</li>
</div>

<style>

</style>