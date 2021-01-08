const config = getConfig();
let peerConnection;
let streamerId;
const video = doc.querySelector("video");
const toggleAudioButton = doc.querySelector("#toggle-audio");

if (config) {
  peerConnection = new RTCPeerConnection(config);
  init();
}

function init() {

  toggleAudioButton.addEventListener("click", toggleAudio);

  config.socket.on("offer", (data) => {
    streamerId = data.streamerId;
    notify(`${data.broadcasterName} 正在直播`);

    peerConnection
      .setRemoteDescription(data.msg)
      .then(() => peerConnection.createAnswer())
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        config.socket.emit("answer", {
          ...data,
          localDescription: peerConnection.localDescription,
        });
      });
    peerConnection.ontrack = event => {

      toggleElement('.wait-broadcasting', '.broadcasting');

      video.srcObject = event.streams[0];

    };
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        config.socket.emit("candidate", {
          id: streamerId,
          candidate: event.candidate
        });
      }
    };
  });


  config.socket.on("candidate", (candidateObj) => {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidateObj.candidate))
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