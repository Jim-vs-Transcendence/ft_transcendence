<script lang="ts">
  import MatchHistory from '../Profile/MatchHistory.svelte';
  import '../../service/friendDTO'
  
  export let profile_info: UserDTO;

</script>

<div class="card flex flex-col items-center">
    <header class="card-header"></header>
    <img src="{profile_info.avatar}" alt="인트라 프로필" class="w-48 h-48 rounded-full mb-4">
    <ul class="text-center">
      <li class="text-lg font-bold">가짜이름 : {profile_info.nickname}</li>
      <li class="text-lg font-bold">인트라 ID: {profile_info.id}</li>
    </ul>
    <MatchHistory {profile_info}/>
    <footer class="card-footer"></footer>
</div>
