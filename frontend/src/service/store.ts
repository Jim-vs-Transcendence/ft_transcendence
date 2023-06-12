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
            authToken.resetAuthToken();
        }
    }
    return {
        isLogin
    }
}

function setAuthToken() {

    let token: string | null;

    if (browser) {
        token = localStorage.getItem('authToken');
    }
    const { set } = writable(token);
    const idStore = writable();


    const login = async (id: string) => {
        try {
            const response = await getApi({ path: 'token/' + id });
            token = response;

            // console.log(token); 
            // // debug

            if (browser && token) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('userid', id);
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