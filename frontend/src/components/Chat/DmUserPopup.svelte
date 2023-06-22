<script lang="ts">
    import '../../service/userDTO';
    import type { DmChatStoreIF } from '$lib/interface';
    
    // tmp
    export let dmUserInfo: UserDTO;
    // real data 
    // export let dmUserDmChatStore: DmChatStoreIF;

    function fn(data: string) {
        console.log(data);
    }

</script>

<div class="card max-w-[30%] max-h-[30%]" data-popup={dmUserInfo.id}>
    <p> something </p>
    <p> to be DM chat </p>
</div>