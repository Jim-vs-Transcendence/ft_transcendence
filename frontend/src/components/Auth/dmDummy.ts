// import '$lib/interface.d.ts'
// import '../../lib/interface.d.ts'
import type { DmChatStoreIF }  from '$lib/interface';

/*
interface DmChatIF {
	_msg: string;
	_from: string;
	_to: string;
}

interface DmUserInfoIF {
	_avatar: string;
	_dmChatStore: DmChatIF[];
}

interface DmChatStoreIF {
	[opponent: string]: DmUserInfoIF;
}

*/


export const dmDummyList: DmChatStoreIF[] = [
  {
    "jim": {
      "_useInfo": {
        "id": "jim",
        "nickname": "Opponent 1",
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
          "_to": "me"
        },
        {
          "_msg": "How are you?",
          "_from": "me",
          "_to": "jim"
        }
      ]
    }
  },
  {
    "yolee": {
      "_useInfo": {
        "id": "yolee",
        "nickname": "Opponent 2",
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
          "_from": "yolee",
          "_to": "me"
        },
        {
          "_msg": "Are you free to play?",
          "_from": "me",
          "_to": "yolee"
        }
      ]
    }
  }
];


// export const dmDummyList: DmChatStoreIF[] = [
//     {
//       "jim": {
//         _avatar: "https://cdn.intra.42.fr/users/0deac2fad263069699a587baaf629266/jim.JPG",
//         _dmChatStore: [
//           {
//             _msg: "Hello!",
//             _from: "jim",
//             _to: "yolee"
//           },
//           {
//             _msg: "Hi there!",
//             _from: "yolee",
//             _to: "jim"
//           }
//         ]
//       }
//     },
//     {
//       "yolee": {
//         _avatar: "https://cdn.intra.42.fr/users/b3db6af844578c88432ba57ac1c6bd3a/yolee.jpg",
//         _dmChatStore: [
//           {
//             _msg: "Hey!",
//             _from: "yolee",
//             _to: "jim"
//           },
//           {
//             _msg: "How are you?",
//             _from: "jim",
//             _to: "yolee"
//           }
//         ]
//       }
//     },
// ];
  