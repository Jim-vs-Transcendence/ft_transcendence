<!-- auth : 토큰 발급을 위한 임시 페이지 -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation'
    import { authToken } from '../../../../service/store';
    import { page } from '$app/stores';
    
    import LoadingMessage from '../../../../components/Auth/LoadingMessage.svelte';

    const id = $page.params.id;
    let userInfo : UserDTO;

    onMount(async () => {
        await authToken.login(id);
        goto('/main');
    }
    
    );
</script>

<LoadingMessage />


