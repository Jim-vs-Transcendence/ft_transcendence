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
            "twoFactorCode": input
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

  import { spring } from 'svelte/motion'
    let coords_r = spring({ x: Math.random() * 10000, y: Math.random() * 10000 },{
        stiffness: 0.1,
        damping: 0.6
    });
    let coords_g = spring({ x: Math.random() * 10000, y: Math.random() * 10000 },{
        stiffness: 0.1,
        damping: 0.3
    });
    let coords_b = spring({ x: Math.random() * 10000, y: Math.random() * 10000 },{
        stiffness: 0.05,
        damping: 0.2
    });
  
</script>

<div class="wrapper" on:mousemove="{e => {
  coords_r.set({ x: e.clientX - 50, y: e.clientY });
  coords_g.set({ x: e.clientX , y: e.clientY - 200 });
  coords_b.set({ x: e.clientX + 50, y: e.clientY - 50 });
}}">
  <div class="container">
    <div class="card p-4">
      <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
        <input type="search" class={errorClass} placeholder="인증키" bind:value={authKey} />
        <button class="variant-filled-secondary" on:click={() =>{ handleSubmit(authKey) }}>제출</button>
      </div>
    </div>
  </div>

  <svg style="pointer-events: none;">
    <circle cx={$coords_r.x} cy={$coords_r.y} r="20" fill="red" />
    <circle cx={$coords_g.x} cy={$coords_g.y} r="25" fill="green" />
    <circle cx={$coords_b.x} cy={$coords_b.y} r="30" fill="blue" />
  </svg>
</div>

<style>
  .wrapper {
    position: relative;
    height: 100vh;
  }

  .container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    z-index: 1;
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }
</style>