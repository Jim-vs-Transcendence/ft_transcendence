<script lang="ts">
    import '../../service/userDTO';
    import type { DmChatStoreIF } from '$lib/interface';
    
    // tmp
    export let dmUserInfo: UserDTO;
    // real data 
    // export let dmUserDmChatStore: DmChatStoreIF;

    function fn(userInfo: UserDTO) {
        console.log(userInfo);
    }

</script>

<!-- <div class="card max-w-[30%] max-h-[30%]" data-popup="dmPopup{dmUserInfo.id}"> -->
<!-- <div class="card max-w-[30%] max-h-[30%]" on:keydown={()=> console.log(dmUserInfo)} on:click={() => fn(dmUserInfo)}> -->
<div class="card max-w-[30%] max-h-[30%]" on:click={() => fn(dmUserInfo)}>
    <p> something </p>
    <p> to be DM chat </p>
</div>