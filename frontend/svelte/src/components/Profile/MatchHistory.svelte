<script lang="ts">
    export let profile_info: UserDTO;

    let profile_id : string = profile_info.id;
    import { getApi } from '../../service/api';
    import { onMount } from 'svelte';
    import '../../service/matchDTO';

    let matchHistory : MatchDTO[] = [];

    function goJIM() {
        window.open('https://profile.intra.42.fr/users/jim', '_blank');
    }

    onMount(async () => {
        matchHistory = await getApi({ path: 'match-history/' + profile_id });
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
 </script>

<div class="card">
    <header class="card-header text-center text-4xl" style="font-weight: 700;">싸운 흔적</header><br>
    {#each matchHistory as history }
        <section class="p-4 text-center flex flex-col">
            {#if history.winLose }
                <span class="text-2xl" style="font-weight: 700;">이김</span>
            {:else}
                <span
                    class="text-2xl"
                    role="button"
                    tabindex="0"
                    style="font-weight: 700;"
                    on:click={goJIM}
                    on:keydown={(e) => {
                        if (e.key === 'Enter') {
                            goJIM();
                        }
                    }}
                >
                    JIM
                </span>
            {/if}
            <span style="font-weight: 500">
                {history.player1} {history.player1_score} vs {history.player2_score} {history.player2}
            </span>

        </section>
    {/each}

    <br><footer class="card-footer text-center">전적 조회는 최근 5회만 지원됩니다. 자세한 내용은 고개를 돌려 고객센터에 문의하세요.</footer>
</div>
