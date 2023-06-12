export interface GameRoom {
	_roomName: string;

	_canvasColor: string;

	// Ball Location
	_ballRadius: number;
	_ballSpeed: number;
}

export const gameRoom : GameRoom = {
	_roomName: '',
	_canvasColor: '',
	_ballRadius: 0,
	_ballSpeed: 0,
}