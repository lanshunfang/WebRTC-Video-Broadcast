let urlparams = new URLSearchParams(location.search);
const username = urlparams.get("zoomid");
const password = prompt(`请输入房间号"${username}"密码`);
const server = urlparams.get("server");
const CONFIG = {
    iceServers: [
        {
            //"urls": "stun:stun.l.google.com:19302",
            "urls": `stun:${server}`,
        },
        {
            "urls": `turn:${server}?transport=udp`,
            "username": username,
            "credential": password
        }
    ],
    getIONS(){
        return encodeURIComponent(`${username}[${server}]`)
    }

}
