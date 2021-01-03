let urlparams = new URLSearchParams(location.search);
const username = urlparams.get("zoomid");
const password = urlparams.get("pwd");
const CONFIG = {
  iceServers: [
    {
      //"urls": "stun:stun.l.google.com:19302",
      "urls": "stun:stun.xiaofang.me:5349",
    },
     { 
       //"urls": "turn:turn.xiaofang.me?transport=tcp",
       "urls": "turn:turn.xiaofang.me?transport=udp",
       "username": username,
       "credential": password
     }
  ]

}
