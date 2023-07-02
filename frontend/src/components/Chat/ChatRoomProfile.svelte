<script lang="ts">
    export let profile_info: UserDTO;
    // export let isMyself: boolean;
    // export let isFriend: boolean;

    // import "../Profile/MatchHistory.svelte";
    import MatchHistory from '../Profile/MatchHistory.svelte';

    // $: isFriend;
    $: friendStat;

    import '../../service/friendDTO'

    // let isBlocked : boolean = false;
    // $ : isBlocked;

    //유저가 친구인지 뭔지에 대한 정보
    let friendStat : string;


</script>

<div class="card flex flex-col items-center">
    <header class="card-header"></header>
    <img src="{profile_info.avatar}" alt="인트라 프로필" class="w-48 h-48 rounded-full mb-4">
    <ul class="text-center">
      <!-- {#if ! (isMyself)} -->
      <!-- chat room에서도 친구여부, 차단 여부를 보여줄지는 고민 필요 -->
      {#if false}
        <!-- <div>
          {#if friendStat === "blocked"}
          <p>차단한 반동분자</p>
          {:else if friendStat === "accepted"}
          <p>수락한 친구</p>
          {:else if friendStat === "pending"}
          <p>안 수락함</p>
          {:else}
          <p>아무것도 아닌 사람</p>
        </div> -->
      {/if}
      <li class="text-lg font-bold">가짜이름 : {profile_info.nickname}</li>
      <li class="text-lg font-bold">인트라 ID: {profile_info.id}</li>
    </ul>
    <MatchHistory {profile_info}/>
    <footer class="card-footer"></footer>
</div>
