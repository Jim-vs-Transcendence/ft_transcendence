<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores';
  import LoadingMessage from '../../../../components/Auth/LoadingMessage.svelte';
  import { postApi } from '../../../../service/api';
  import { onMount } from 'svelte';

  const id = $page.params.id;
  let response: boolean;
  let authKey : string;
  let errorClass = "";

  async function handleSubmit(input: string): Promise<void> {    
    try {
        response = await postApi({ path: 'two-factor/authentication/' + id, data: 
          {
            "twoFactorAuthenticationCode": input
          }
        }
      );
    //  나중에 백에서 처리하게 변경
    if (response === true)
    {
      goto(`../login/${id}`);
    }

    } catch (error) {
      alert("에러");
    }
  }

  $: {
    if (response === false) {
      errorClass = "input-error";
    } else {
      errorClass = "";
    }
  }
  
</script>


<div class="container">
  <div class="card p-4">
    <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
      <input type="search" class={errorClass} placeholder="인증키" bind:value={authKey} />
      <button class="variant-filled-secondary" on:click={handleSubmit(authKey)}>제출</button>
    </div>
  </div>
</div>

<style>
  .container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  }
</style>