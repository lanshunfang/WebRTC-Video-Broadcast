const config = getConfig();
let peerConnection;
const video = doc.querySelector("video");
const toggleAudioButton = doc.querySelector("#toggle-audio");

if (config) {
  init();
}

function init() {

  toggleAudioButton.addEventListener("click", toggleAudio);

  config.socket.on("offer", (data) => {
    notify(`${data.broadcasterName} 正在直播`);
    peerConnection = new RTCPeerConnection(config);
    peerConnection
      .setRemoteDescription(data.msg)
      .then(() => peerConnection.createAnswer())
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        config.socket.emit("answer", data.id, peerConnection.localDescription);
      });
    peerConnection.ontrack = event => {

      toggleElement('.wait-broadcasting', '.broadcasting');

      video.srcObject = event.streams[0];

    };
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        config.socket.emit("candidate", data.id, event.candidate);
      }
    };
  });


  config.socket.on("candidate", (id, candidate) => {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch(e => console.error(e));
  });

  config.socket.on("connect", () => {
    emitWatcher();
  });

  config.socket.on("broadcaster", () => {
    emitWatcher();
  });

  window.onunload = window.onbeforeunload = () => {
    config.socket && config.socket.close();
    peerConnection && peerConnection.close();
  };
}


function toggleAudio() {
  video.muted = !video.muted;
  toggleAudioButton.innerText = video.muted ? "开启声音" : "静音";
}

function emitWatcher() {
  config.socket.emit("watcher", {
    id: config.socket.id,
    fullname: config.fullname
  });
}