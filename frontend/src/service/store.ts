import { writable } from "svelte/store";
import { getApi, petchApi, delApi, postApi } from "../service/api";
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

function setAuth() {
    const isLogin = async () => {
        try {
            const getUserInfo = await getApi({path: 'token'});
            return getUserInfo;
        }
        catch(error)
        {
            // cookie로 대체해야함
            // authToken.resetAuthToken();
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
            // token = response;

            const loginResponse: loginDTO = response;
            token = loginResponse.token;
            const isLogin = loginResponse.islogin;

            console.log(loginResponse);

            // console.log(token);
            // // debug

            if (browser && token && isLogin) {
                localStorage.setItem('authToken_' + id, token);
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

export const auth = setAuth();
export const authToken = setAuthToken();
