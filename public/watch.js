const config = getConfig();
let peerConnection;
const socket = io("/" + config.getIONS());
const video = document.querySelector("video");
const toggleAudioButton = document.querySelector("#toggle-audio");

if (config) {
  init();
}

function init() {

  toggleAudioButton.addEventListener("click", toggleAudio)

  socket.on("offer", (data) => {
    notifyMe(`${data.broadcasterName} 正在直播`);
    peerConnection = new RTCPeerConnection(config);
    peerConnection
      .setRemoteDescription(data.msg)
      .then(() => peerConnection.createAnswer())
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("answer", data.id, peerConnection.localDescription);
      });
    peerConnection.ontrack = event => {
      broadcastStateChange();
      video.srcObject = event.streams[0];

    };
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", data.id, event.candidate);
      }
    };
  });


  socket.on("candidate", (id, candidate) => {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch(e => console.error(e));
  });

  socket.on("connect", () => {
    emitWatcher(socket);
  });

  socket.on("broadcaster", () => {
    emitWatcher(socket);
  });

  window.onunload = window.onbeforeunload = () => {
    socket && socket.close();
    peerConnection && peerConnection.close();
  };
}


function toggleAudio() {
  video.muted = !video.muted;
  toggleAudioButton.innerText = video.muted ? "开启声音" : "静音";
}

function broadcastStateChange(isStop = false) {
  let ele1 = '.wait-broadcasting', ele2 = '.broadcasting';

  if (isStop) {
    [ele1, ele2] = [ele2, ele1];
  }

  doc.querySelector(ele1).classList.add('hide');
  doc.querySelector(ele2).classList.remove('hide');
}

function emitWatcher(socket) {
  socket.emit("watcher", {
    id: socket.id,
    fullname: config.fullname
  });
}