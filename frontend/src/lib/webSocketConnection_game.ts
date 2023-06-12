const backUrl = import.meta.env.VITE_API_URL;
import ioClient from 'socket.io-client';

const ENDPOINT = backUrl + '/game';

const socket = ioClient(ENDPOINT);

export const io_game = socket;