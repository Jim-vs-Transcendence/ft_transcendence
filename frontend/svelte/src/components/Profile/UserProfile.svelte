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
    import '../../service/friendDTO';

    let isBlocked : boolean = false;
    $ : isBlocked;

    let qr : any;
    let popQR : boolean = false;

    //유저가 친구인지 뭔지에 대한 정보
    let friendInfo : friendDTO;
    let friendStat : string;

    enum FriendRequestStatus {
        BLOCKED = 'blocked',
        PENDING = 'pending',
        ACCEPTED = 'accepted',
    };

    import { getApi, petchApi, postApi, delApi, postApiWithFile } from '../../service/api';

    // Two-factor toggle
    import { SlideToggle } from '@skeletonlabs/skeleton';

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
                errorToast('two factor 업데이트 실패');
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
                errorToast('two factor 업데이트 실패')
            }
        }
    }

    let inputCode : string = "";
    //투팩터 팝업 -> 구글어스 출력
    async function close_qr(event: KeyboardEvent) {
        if (event.key === 'Enter') {
        try {
                const response = await postApi({
                    path: 'two-factor/init_authentication/' + profile_info.id,
                    data: {
                        "twoFactorCode": inputCode
                        }
                    });
                    if (response === true) {
                        two_factor_toggle();
                        popQR = false;
                    }
            } catch (error) {
                errorToast('two factor 인증 실패');
            }
        }
    }

    //프로필 사진 업로드
    import { FileButton } from '@skeletonlabs/skeleton';
	import { BlOCKED_USER_KEY } from '$lib/webSocketConnection_chat';

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
            if (friendStat === "blocked")
                isBlocked = true;
            else
                isBlocked = false;
		}
		catch(error){
            errorToast('유저 정보를 가져올 수 없습니다');
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

			if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
                errorToast('잘못된 파일 형식입니다');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                errorToast('5MB 이하의 파일만 업로드 가능합니다');
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

    // 친구 추가
	async function requestFriend() {
	    try {
	        if (friendStat === "pending") {
                errorToast("이미 동무 요청을 보냈습니다");
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
            errorToast('동무 요청을 보낼 수 없습니다');
	    }
	}

    //친구 제거
    async function deleteFriend() {
        try {
            await delApi({ path: 'friends/' + profile_info.id , data:{
            } });
            isFriend = false;
        } catch (error) {
        }
    }

    //검열
    async function blockToggle() {
        if (isBlocked === false)
        {
            try {
                await postApi({ path: 'friends/blocks/' + profile_info.id , data:{} });
                isBlocked = true;
                friendStat = "blocked";
                // friendDTO
                let newBlockedFriend: friendDTO = {
                    id: profile_info.id,
                    nickname: profile_info.nickname,
                    avatar: profile_info.avatar,
                    status: profile_info.user_status,
                    friendStatus: FriendRequestStatus.BLOCKED,
                };
                const loadBlockedFrindList : string | null = localStorage.getItem(BlOCKED_USER_KEY);
                let blockedFriends : friendDTO[] = []
                if (loadBlockedFrindList) {
                    blockedFriends = JSON.parse(loadBlockedFrindList);
                }
                blockedFriends.push(newBlockedFriend);
                localStorage.setItem(BlOCKED_USER_KEY, JSON.stringify(blockedFriends));
            } catch (error) {
                errorToast('검열에 실패했습니다');
            }
        }
        else
        {
            try {
                isBlocked = false;
                friendStat = " ";
                await delApi({ path: 'friends/unblocks/' + profile_info.id , data:{
                    "user_to" : profile_info.id,
                }});
                const loadBlockedFrindList : string | null = localStorage.getItem(BlOCKED_USER_KEY);
                if (loadBlockedFrindList) {
					let blockedFriends : friendDTO[] = JSON.parse(loadBlockedFrindList);
                    let to_be_remove_index: number = -1;
                    blockedFriends.forEach((blockedFriend, index) => {
                        if (blockedFriend.id === profile_info.id)
                            to_be_remove_index = index;
					})
                    if (to_be_remove_index !== -1)
                        blockedFriends.splice(to_be_remove_index, 1);
                    localStorage.setItem(BlOCKED_USER_KEY, JSON.stringify(blockedFriends));
				}
            } catch (error) {
                errorToast('검열 해제에 실패했습니다');
            }
        }
    }

    let isNickChange : boolean = false;
    let inputElement : string;

// 닉네임 변경
    $: profile_info.nickname;

    function handleNicknameChange() {
        if (isNickChange === false)
        {
            isNickChange = true;
        }
        else
        {
            isNickChange = false;
        }
    }

    async function handleChangeNickname() {
        if (inputElement.length === 0 || inputElement === profile_info.nickname)
        {
            errorToast('잘못된 가짜이름 입니다');
            return;
        }
        if (inputElement.length > 10)
        {
            errorToast('너무 긴 가짜이름으로는 변경할 수 없습니다');
            return;
        }
        try {
            await petchApi({ path: 'user/'+profile_info.id , data:{
                "nickname" : inputElement
            },
        });
        profile_info.nickname = inputElement;
        inputElement = "";
        isNickChange = true;

        } catch (error) {
            errorToast('가짜이름을 변경할 수 없습니다');
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            handleChangeNickname();
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
            <button on:click={handleNicknameChange}>가짜이름 변경</button>
            {#if isNickChange}
                <input class="input" type="text" placeholder="바꿀 닉네임 넣어요. 10글자 아래로." bind:value={inputElement} on:keydown={handleKeyDown}/>
            {/if}
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
                            <input class="input" type="text" placeholder="이거 진짜 했으면 구글 인증기 코드를 입력하고 엔터 누르던지" bind:value={inputCode} on:keydown={close_qr}/>
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
<Toast max={5} buttonDismiss={'btn variant-filled'} buttonDismissLabel={'거절'} />
