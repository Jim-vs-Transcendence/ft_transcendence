import axios from "axios";


const send = async (method : string = '', path : string = '', data : any = {}, headers : any = {}) : Promise<any> => {
  const backUrl = import.meta.env.VITE_API_URL;
  const url = backUrl + '/' + path;
  const getToken = localStorage.getItem('authToken_' + localStorage.getItem('userid'));
  const getLogin = sessionStorage.getItem('isLogin');

  // If data is an instance of FormData, let the browser set the Content-Type header
  const contentType = data instanceof FormData ? undefined : 'application/json';

  // 기본 헤더 설정
  const defaultHeaders = {
    'Content-Type': contentType,
    'authtoken': getToken,
    'islogin': getLogin,
  };

  // 사용자 정의 헤더가 제공되면 기본 헤더를 덮어쓴다. 파일을 보내는 경우, 브라우저가 헤더를 알아서 설정한다.
  const finalHeaders = { ...defaultHeaders, ...headers };

  const options = {
    method,
    url,
    headers: finalHeaders,
    data,
    withCredentials: true,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 파일 업로드를 위한 post 함수. 브라우저가 알아서 header를 설정하게 된다.
const postApiWithFile = async ({ path = '', file }: { path: string; file: File }) => {
  const formData = new FormData();
  formData.append('image', file);

  return send('POST', path, formData );
};

const getApi = ({ path = '' }: { path: string }) => {
  return send('GET', path );
};
const petchApi = ({ path = '', data = {} }: { path: string; data: any }) => {
  return send('PATCH', path, data );
};
const postApi = ({ path = '', data = {} }: { path: string; data: any }) => {
  return send('POST', path, data );
};
const delApi = ({ path = '', data = {} }: { path: string; data: any }) => {
  return send('DELETE', path, data );
};

export { getApi, petchApi, postApi, delApi, postApiWithFile };
