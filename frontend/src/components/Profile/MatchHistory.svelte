<script lang="ts">
    export let profile_info: UserDTO;

    let profile_id : string = profile_info.id;
    import { getApi } from '../../service/api';
    import { onMount } from 'svelte';
    import '../../service/matchDTO';

    let matchHistory : MatchDTO[] = [];

    onMount(async () => {
        matchHistory = await getApi({ path: 'match-history/' + profile_id });
        // if profile_id win -> true
        matchHistory = matchHistory.map(function(history) {
            if (profile_id == history.player1
            && history.player1_score > history.player2_score) {
                history.winLose = true;
                return history;
            } else if (profile_id == history.player2
            && history.player2_score > history.player1_score) {
                history.winLose = true;
                return history;
            }
            history.winLose = false;
                return history;
        });
    })


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

<div class="card">
    <header class="card-header text-center">싸운 흔적</header>
    {#each matchHistory as history }
        <section class="p-4 text-center flex flex-col">
            {#if history.winLose }
                <span>이김</span>
            {:else}
                <span>JIM</span>
            {/if}
            {history.player1} {history.player1_score} vs {history.player2_score} {history.player2}

        </section>
    {/each}

    <footer class="card-footer text-center">전적 조회는 최근 5회만 지원됩니다. 자세한 내용은 고개를 돌려 고객센터에 문의하세요.</footer>
</div>

<!-- <svg on:mousemove="{e => {
    coords_r.set({ x: e.clientX - 50, y: e.clientY });
    coords_g.set({ x: e.clientX , y: e.clientY - 200 });
    coords_b.set({ x: e.clientX + 50, y: e.clientY - 50 });
}}">
    <circle cx={$coords_r.x} cy={$coords_r.y} r="20" fill="red" />
    <circle cx={$coords_g.x} cy={$coords_g.y} r="25" fill="green" />
    <circle cx={$coords_b.x} cy={$coords_b.y} r="30" fill="blue" />
</svg> -->

<style>
    svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: auto;
    }
</style>
