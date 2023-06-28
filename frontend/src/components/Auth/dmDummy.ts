import '$lib/interface.d.ts'
// import '../../lib/interface.d.ts'
import type { DmChatStoreIF }  from '$lib/interface';

/*
*/
// UserDTO


// interface UserDTO {
//   id: string;
//   nickname: string;
//   avatar: string;
//   email: string;
//   level: number;
//   win: number;
//   lose: number;
//   two_factor: boolean;
//   user_status: number;
// }

// interface DmChatIF {
// 	_msg: string;
// 	_from: string;
// 	_to: string;
// }

// interface DmUserInfoIF {
// 	_userInfo: UserDTO;
// 	_dmChatStore: DmChatIF[];
// }

// interface DmChatStoreIF {
// 	[opponent: string]: DmUserInfoIF;
// }



export const dmDummyList: DmChatStoreIF = {
  "jim": {
      "_userInfo": {
        "id": "jim",
        "nickname": "닉네임",
        "avatar": "https://cdn.intra.42.fr/users/0deac2fad263069699a587baaf629266/jim.JPG",
        "email": "jim@example.com",
        "level": 5,
        "win": 10,
        "lose": 5,
        "two_factor": true,
        "user_status": 1
      },
      "_dmChatStore": [
        {
          "_msg": "Hello!",
          "_from": "jim",
          "_to": "yolee"
        },
        {
          "_msg": "How are you?",
          "_from": "yolee",
          "_to": "jim"
        }
      ]
  },
  "yolee": {
    "_userInfo": {
      "id": "yolee",
      "nickname": "닉네임",
      "avatar": "https://cdn.intra.42.fr/users/b3db6af844578c88432ba57ac1c6bd3a/yolee.jpg",
      "email": "yolee@example.com",
      "level": 3,
      "win": 7,
      "lose": 12,
      "two_factor": false,
      "user_status": 2
    },
    "_dmChatStore": [
      {
        "_msg": "Hi!",
        "_from": "jim",
        "_to": "yolee"
      },
      {
        "_msg": "Are you free to play?",
        "_from": "yolee",
        "_to": "jim"
      }
    ]
  }
};
