<script lang="ts">
    export let profile_info: UserDTO;
    export let isMyself: boolean;
    export let isFriend: boolean;

    $: isFriend;
    $: friendStat;

    import { page } from '$app/stores';
    import { onMount } from 'svelte';
	import { auth } from '../../service/store';
	import { goto } from '$app/navigation';
    import '../../service/friendDTO'

    let isBlocked : boolean = false;
    $ : isBlocked;

    let qr : any;
    let popQR : boolean = false;

    //유저가 친구인지 뭔지에 대한 정보
    let friendInfo : friendDTO;
    let friendStat : string;

    import { getApi, petchApi, postApi, delApi, postApiWithFile } from '../../service/api';

    // Two-factor toggle
    import { SlideToggle } from '@skeletonlabs/skeleton';
    let twoFactor : number;

    $: if (twoFactor >= 50) {
    if (!profile_info.two_factor) {
        popQR = true;
        (async () => { qr = await postApi({ path: 'two-factor/generate', data:{} }); })();
    }
    profile_info.two_factor = true;
  } else if (twoFactor < 50) {
    if (profile_info.two_factor) {
        two_factor_toggle();
        popQR = false;
    }
    profile_info.two_factor = false;
  }
    $: text = profile_info.two_factor ? '전자우편 인증 작동중' : '전자우편 인증 미작동중';

    async function two_factor_toggle() {
        if (twoFactor >= 50)
        {
            try {
                petchApi({ path: 'user/'+profile_info.id , data:{
                    two_factor: true
                },
            })
            } catch (error) {
                alert("설정 실패");
            }
        }
        else
        {
            try {
                petchApi( { path: 'user/'+profile_info.id , data:{
                    two_factor: false
                },
            })
            } catch (error) {
                alert("설정 실패")
            }
        }
        console.log(getApi({ path: 'user/'+profile_info.id }));

    }

    //투팩터 팝업 -> 구글어스 출력
    async function close_qr() {

        const input : string | null = prompt('구글 인증기에 등록했나요? 코드를 입력하세요');
        try {
            const response = await postApi({
                path: 'two-factor/init_authentication/' + profile_info.id,
                data: {
                    "twoFactorCode": input
                    }
                    }
                );
                console.log(response);
                if (response === true) {
                    two_factor_toggle();
                    popQR = false;
                }
        } catch (error) {
            alert("에러");
        }
    }

    //프로필 사진 업로드
    import { FileButton } from '@skeletonlabs/skeleton';
	import FriendsList from './FriendsList.svelte';

    // 투팩터 초기 설정
    onMount(async () => {
        profile_info = await getApi({ path: 'user/' + profile_info.id });
		try{
			if (isMyself === true)
            {
                if (profile_info.two_factor === true)
                {
                    twoFactor = 100;
                }
                else
                {
                    twoFactor = 0;
                }
            }
            //친구인지 여부 뭐 그런거 가져와야 함
            friendInfo = await getApi({ path: 'friends/' + profile_info.id });
            friendStat = friendInfo.friendStatus;
		}
		catch(error){
			alert('오류 : 프로필을 출력할 수 없습니다3');
			goto('/main');
		}
	});

    // 아바타 업로드
    let uploaded_pic: FileList;
    $: profile_info.avatar;

    async function uploadHandler(): Promise<void> {
        try {
            if (uploaded_pic && uploaded_pic.length > 0) {
            const file = uploaded_pic[0];

            if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
                alert('jpeg나 png만 지원합니다');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('당신 얼굴의 크기가 너무 큽니다. 5MB까지만 올릴 수 있습니다.');
                return;
            }
            const formData = new FormData();
            formData.append('image', file);

            const response = await postApiWithFile({
                path: 'user/uploads',
                file
            });
            profile_info = await getApi({ path: 'user/' + profile_info.id });
            }
        } catch (error) {
            console.error('에러 발생:', error);
        }
    }

    // 닉네임 변경
    async function handleChangeNickname() {
        const nickname : string = prompt_string();
        function prompt_string () : string
        {
            let text : string | null = prompt('변경할 가짜 이름을 입력하세요');
            if (text == null)
                text = "";
            return (text);
        }
        if (nickname === "" ||nickname === profile_info.nickname) return;
        if (nickname.length > 20)
        {
            alert("Fork you r nickname : too long");
            return;
        }
        try {
            await petchApi({ path: 'user/'+profile_info.id , data:{
                "nickname" : nickname
            },
        });
        profile_info.nickname = nickname;

        } catch (error) {
            alert("가짜이름 설정 실패");
        }
    }

    // 친구 추가
	async function requestFriend() {
	    try {
	        if (friendStat === "pending") {
	            alert("이미 친구신청 했습니다. 어쩌면 저 사람은 당신과 친구가 되고 싶지 않을 수 있습니다.");
	        }
			else {
	            await postApi({
	                path: 'friends/requests',
	                data: {
	                    "user_to": profile_info.id
	                }
	            });
				friendInfo = await getApi({
	                path: 'friends/' + friendInfo.id,
	            });
				friendStat = friendInfo.friendStatus;
	        }
	    } catch (error) {
	        alert("친구신청 실패");
	    }
	}

    //친구 제거
    async function deleteFriend() {
        try {
            await delApi({ path: 'friends/' + profile_info.id , data:{
            } });
            isFriend = false;
        } catch (error) {
            alert("wer");
        }
    }

    //검열
    async function blockToggle() {
        if (isBlocked === false)
        {
            try {
            await postApi({ path: 'friends/blocks/' + profile_info.id , data:{
            }
            });
            isBlocked = true;
            friendStat = "blocked";
            } catch (error) {
                alert("블럭 오류");
            }
        }
        else
        {
            try {
            await delApi({ path: 'friends/' + profile_info.id , data:{
                "user_to" : profile_info.id
            }
            });
            isBlocked = false;
            friendStat = " ";
            } catch (error) {
                alert("블럭 해제 오류");
            }
        }
    }

</script>

<!-- <div class="card flex flex-col items-center"> -->
<div class="card flex flex-col items-center">
    <header class="card-header"></header>
    <img src="{profile_info.avatar}" alt="인트라 프로필" class="w-48 h-48 rounded-full mb-4">
    <ul class="text-center">
      {#if isMyself}
        <div>
            <FileButton
                name="files"
                bind:files={uploaded_pic}
                on:change={uploadHandler}
                >얼굴 개시</FileButton>
            <button on:click={handleChangeNickname}>가짜이름 변경</button>
        </div>
      {:else}
        <div>
            {#if friendStat === "blocked"}
            <p>차단한 반동분자</p>
            {:else if friendStat === "accepted"}
            <p>수락한 친구</p>
            {:else if friendStat === "pending"}
            <p>안 수락함</p>
            {:else}
            <p>아무것도 아닌 사람</p>
         {/if}
        </div>
      {/if}
      <li class="text-lg font-bold">가짜이름 : {profile_info.nickname}</li>
      <li class="text-lg font-bold">인트라 ID: {profile_info.id}</li>
    </ul>
    <footer class="card-footer"></footer>
</div>

<!-- two-factor 혹은 친구 -->
<div class="grid">
    {#if isMyself === true}
            {#if popQR === true}
                <div class="fixed inset-0 flex items-center justify-center z-50">
                    <div class="card p-4">
                        <h1>디스이즈 구-글 인증</h1>
                        <img src={qr} alt="QR코드" class="w-64 h-64 mb-4">
                        <div style="display: flex; justify-content: center; align-items: center;">
                            <button type="button" class="btn variant-ghost" on:click={close_qr}>
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- two-factor 인증\-->
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="flex items-center">
                <input type="range" bind:value={twoFactor} max="100" />
                <!-- <SlideToggle name="slide" bind:checked={profile_info.two_factor} on:click={two_factor_toggle} /> -->
                <span class="ml-2">
                    {text}
                </span>
            </label>
    {:else}
        <div class="flex justify-center pt-4">
            <div class="btn-group variant-filled mx-auto inline-flex">
            {#if isFriend === true}
                <button class="flex-1" on:click={deleteFriend}>무참히 절교</button>
            {:else}
                <button class="flex-1" on:click={requestFriend}>동무 추가</button>
                {#if friendStat === "blocked"}
                    <button class="flex-1" on:click={blockToggle}>검열 해제</button>
                {:else}
                    <button class="flex-1" on:click={blockToggle}>검열</button>
                {/if}
            {/if}
            </div>
        </div>
    {/if}
</div>
