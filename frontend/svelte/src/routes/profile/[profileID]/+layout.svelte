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

<AppBar gridColumns="grid-cols-3" slot="headline" class="h-16">
    <div slot="lead" class="flex items-center space-x-6">
      <!-- 로그아웃, 다크모드 -->
      <button tabindex="0" on:click={logout}>기록 밖으로</button>
    </div>
    <h1 class="h1 text-center -mt-3">
        <!-- 메인 로고 -->
        <span class="text-3xl bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">
            <span role="button" tabindex="0" on:click={goHome} on:keydown={event => event.key === 'Enter' && goHome()} style="cursor: alias;">Jim&nbsp;</span><!--
            --><span role="button" tabindex="0" on:click={goGame} on:keydown={event => event.key === 'Enter' && goGame()} style="cursor: progress;">vs</span><!--
            --><span role="button" tabindex="0" on:click={goHome} on:keydown={event => event.key === 'Enter' && goHome()} style="cursor: alias;">&nbsp;Transcendence</span>
        </span>
    </h1>
    <div></div>
  </AppBar>

  <slot />
