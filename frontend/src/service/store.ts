import { writable, type Writable } from "svelte/store";
import { getApi, petchApi, delApi, postApi } from "../service/api";
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

function setAuth() {
    const isLogin = async () => {
        try {
            const getUserInfo = await getApi({path: 'token'});
            return getUserInfo;
        }
        catch(error) {
            console.log('error');
        }
    }
    return {
        isLogin
    }
}

function setAuthToken() {

    let token: string | null = "";

    if (browser) {
        token = localStorage.getItem('authToken'); // null 잡는거 필요
    }
    const { set } = writable(token);
    const idStore = writable();


    const login = async (id: string) => {
        try {
            const response = await getApi({ path: 'token/' + id });

            const loginResponse: loginDTO = response;
            const isLogin = loginResponse.islogin;

            if (browser && isLogin) {
                localStorage.setItem('userid', id);
                sessionStorage.setItem('isLogin', isLogin);
            }
            else {
                throw new Error('로그인 실패');
            }
            set(token);
            goto('/main');
        }
        catch(error) {
            console.log("로그인 실패 : 토큰");
        }
    }

    const logout = async() => {
        try {
            await getApi({ path: 'auth/logout'});
            if (browser) {
                resetAuthToken();
            }
            goto('/')
        }
        catch(error){
            alert('로그아웃 실패')
        }
    }

    const resetAuthToken = () => {
        set('');
        if (browser) {
            localStorage.removeItem('userid');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('isLogin');
        }
    }

    return {
        login,
        logout,
        resetAuthToken,
    }
}

// function setBlockedFriendList() {
//     const blockedList = async () => {
//         try {
//             const blockedFriendList = await getApi({
    // 				path: 'friends/blocks/',
    // 			});
//             return blockedFriendList;
//         }
//         catch(error) {
//             console.log(error);
//         }
//     }
//     return {
//         blockedList
//     }
// }

export const auth = setAuth();
export const authToken = setAuthToken();
// setBlockedFriendList()과 writable을 같이 쓸 수 있는 방법
export const blockedList : Writable<friendDTO[]> = writable([]);
