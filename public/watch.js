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

  socket.on("offer", (id, description) => {
    peerConnection = new RTCPeerConnection(config);
    peerConnection
      .setRemoteDescription(description)
      .then(() => peerConnection.createAnswer())
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("answer", id, peerConnection.localDescription);
      });
    peerConnection.ontrack = event => {
      video.srcObject = event.streams[0];
    };
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  });


  socket.on("candidate", (id, candidate) => {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch(e => console.error(e));
  });

  socket.on("connect", () => {
    socket.emit("watcher");
  });

  socket.on("broadcaster", () => {
    socket.emit("watcher");
  });

  window.onunload = window.onbeforeunload = () => {
    socket && socket.close();
    peerConnection && peerConnection.close();
  };
}


function toggleAudio() {
  video.muted = !video.muted;
  toggleAudioButton.innerText = video.muted ? "开启声音" : "静音"
}
