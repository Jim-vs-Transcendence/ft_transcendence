<script lang="ts">
    import { AppBar } from '@skeletonlabs/skeleton';
    import { authToken } from '../../../service/store';
	import { goto } from '$app/navigation';

    const logout = () => {
        authToken.logout()
    };

    const goHome = () => {
        goto('/main');
    }

    const goGame = () => {
        goto('/game');
    }

</script>

<AppBar slot="headline" class="h-16">
    <div slot="lead" class="flex items-center space-x-6">
      <!-- 로그아웃, 다크모드 -->
      <button on:click={logout}>기록 밖으로</button>
    </div>
    <h1 class="h1 text-center -mt-3">
        <!-- 메인 로고 -->
        <span class="text-3xl bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">
            <span on:click={goHome} style="cursor: alias;">Jim&nbsp;</span><!--
            --><span on:click={goGame} style="cursor: progress;">vs</span><!--
            --><span on:click={goHome} style="cursor: alias;">&nbsp;Transcendence</span>
        </span>
    </h1>
  </AppBar>

  <slot />
