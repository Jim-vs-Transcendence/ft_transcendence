import axios from "axios";

interface SendOptions {
  method: string;
  path: string;
  data?: any;
}

const send = async ({ method = '', path = '', data = {} }: SendOptions = {}) => {
  let backUrl = import.meta.env.VITE_API_URL;
  const commonUrl = backUrl; // TODO move to .env
  const url = commonUrl + path;
  const getToken = localStorage.getItem('authToken'); //로컬스토리지에 저장된 키 값을 헤더에 붙여서 보낸다
  const headers = {
    'Content-Type': 'application/json',
    'authtoken': getToken,
  };

  const options = {
    method,
    url,
    headers,
    data,
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getApi = ({ path = '' }: { path: string }) => {
  return send({ method: 'GET', path });
};
const petchApi = ({ path = '', data = {} }: { path: string; data: any }) => {
  return send({ method: 'PATCH', path, data });
};
const postApi = ({ path = '', data = {} }: { path: string; data: any }) => {
  return send({ method: 'POST', path, data });
};
const delApi = ({ path = '', data = {} }: { path: string; data: any }) => {
  return send({ method: 'DELETE', path, data });
};

export { getApi, petchApi, postApi, delApi };
