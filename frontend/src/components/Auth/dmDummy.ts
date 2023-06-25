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
        _avatar: "https://cdn.intra.42.fr/users/0deac2fad263069699a587baaf629266/jim.JPG",
        _dmChatStore: [
          {
            _msg: "Hello!",
            _from: "jim",
            _to: "yolee"
          },
          {
            _msg: "Hi there!",
            _from: "yolee",
            _to: "jim"
          }
        ]
      }
    },
    {
      "yolee": {
        _avatar: "https://cdn.intra.42.fr/users/b3db6af844578c88432ba57ac1c6bd3a/yolee.jpg",
        _dmChatStore: [
          {
            _msg: "Hey!",
            _from: "yolee",
            _to: "jim"
          },
          {
            _msg: "How are you?",
            _from: "jim",
            _to: "yolee"
          }
        ]
      }
    },
];
  