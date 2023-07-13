<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation'
  import { auth } from '../service/store';

  let backUrl = import.meta.env.VITE_API_URL;

  import '../service/userDTO';
  import LoadingMessage from "../components/Auth/LoadingMessage.svelte"

  //1. store.ts에 만들어질 isLogin함수 활용해서 로그인 여부 확인
  let userInfo : UserDTO;
  let isLoading = true;

  import { Toast, toastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	function errorToast(msg: string) {
        const t: ToastSettings = {
            message: msg,
            hideDismiss: true,
            timeout: 3000
        };
        toastStore.trigger(t);
	}

  onMount(async () => {
      try {
          userInfo = await auth.isLogin();
          if (userInfo) {
            goto('/main');
          }
          else {
            throw ("Not Login")
          }
      }
      catch(error) {
          isLoading = false;
          if (sessionStorage.getItem('isLogin') === 'remove') {
            sessionStorage.removeItem('isLogin');
            errorToast("연결이 끊겼습니다. 다시 로그인 해주세요");
          }
      }
    }
  );

  //2. 로그인 함수
  // 42auth로 연결해서 로그인 후, main으로 가게 됨. 만약 로그인 실패했으면, main에서 다시 돌아오게 됨
  const login = async () => {
    await goto(backUrl + "/auth/login");
  };

</script>

{#if isLoading}
  <LoadingMessage />
{:else}
  <div class="container h-full mx-auto flex justify-center items-center">
    <div class="space-y-5">
      <button class="skeleton-button variant-glass-secondary btn-lg rounded-lg transition-transform duration-200 ease-in-out hover:scale-110" data-sveltekit-preload-data="hover" on:click={login}>기록 속으로...</button>
    </div>
  </div>
{/if}
<Toast max={5} buttonDismiss={'btn variant-filled'} buttonDismissLabel={'거절'} />
