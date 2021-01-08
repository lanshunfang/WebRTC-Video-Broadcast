
const getConfig = () => {
    let urlparams = new URLSearchParams(location.search);
    const username = urlparams.get("zoomid");
    const server = urlparams.get("server");
    const serverport = urlparams.get("port");

    if (!(username && server && serverport)) {
        alert("链接参数不对。");
        return null;
    }

    const password = getUserInput("password", `房间号"${username}"密码`, 6);
    const fullname = getUserInput("fullname", `您的名字`, 2);

    const config = {

        fullname: fullname,
        iceServers: [
            {
                //"urls": "stun:stun.l.google.com:19302",
                //"urls": "stun:chat.***.com:5349",
                "urls": `stun:${server}:${serverport}`,
            },
            {
                "urls": `turn:${server}:${serverport}?transport=udp`,
                "username": username,
                "credential": password
            }
        ],
        getIONS() {
            return encodeURIComponent(`${username}[${server}]`);
        }

    };

    config.socket = io("/" + config.getIONS());

    return config;

};

const STATE = {
    isTabFocused: true,
};