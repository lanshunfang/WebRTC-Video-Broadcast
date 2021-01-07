const config = getConfig();

// Get camera and microphone
const videoElement = doc.querySelector("video");
const audioSelect = doc.querySelector("select#audioSource");
const videoSelect = doc.querySelector("select#videoSource");

//const socket = io.connect(win.location.origin).of(config.getIONS());
const socket = io("/" + config.getIONS());

let hostkey;

if (config) {
  init();
}

class UserList {
  constructor() {
    this._users = {};
  }
  getUsers() {
    return this._users;
  }
  addUser(watcherObj) {
    const id = watcherObj.id;
    const peerConnection = new RTCPeerConnection(config);
    this._users[id] = {
      id: id,
      peerConnection: peerConnection,
      watcherObj: watcherObj,
    };

    let stream = videoElement.srcObject;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };

    peerConnection
      .createOffer()
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("offer", {
          id,
          msg: peerConnection.localDescription,
          broadcasterName: config.fullname
        });
      });
    notifyMe(`用户加入：${this._users[id].watcherObj.fullname}`);
    this.updateWatcherList();
  }

  updateWatcherList() {
    const container = doc.querySelector('.watcher-list');
    const users = Object.values(this._users)
      .sort((a, b) => a.id === b.id ? 0 : (a.id > b.id ? -1 : 1));
    const usersHtml = users
      .map(
        user => `<li id="${user.id}">${user.watcherObj.fullname}</li>`
      )
      .join('');

    container.innerHTML = usersHtml;

    doc.querySelector('.user-count').innerText = users.length;

  }

  setUserAnswer(id, description) {
    this._users[id].peerConnection.setRemoteDescription(description);
  }

  disconnectUser(id) {
    this._users[id].peerConnection.close();
    delete this._users[id];
    notifyMe(`用户离开：${this._users[id].watcherObj.fullname}`);
    this.updateWatcherList();
  }

  addCandidateToUser(id, candidate) {
    this._users[id].peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
}

const userlist = new UserList();

function init() {
  hostkey = getUserInput("hostkey", "请输入主持人密码。", 6);
  socket.on("answer", (id, description) => {
    userlist.setUserAnswer(id, description);

  });

  socket.on("watcher", watcherObj => {
    userlist.addUser(watcherObj);

  });

  socket.on("candidate", (id, candidate) => {
    userlist.addCandidateToUser(id, candidate);
  });

  socket.on("disconnectPeer", id => {
    userlist.disconnectUser(id);
  });

  win.onunload = win.onbeforeunload = () => {
    socket.close();
  };

  audioSelect.onchange = getStream;
  videoSelect.onchange = getStream;

  getStream()
    .then(getDevices)
    .then(gotDevices);

  setWatcherPreviewLink();

}

function setWatcherPreviewLink() {
  const search = location.search;
  doc.querySelector('#watcher-preview').setAttribute('href', "./" + search);
}

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  win.deviceInfos = deviceInfos;
  for (const deviceInfo of deviceInfos) {
    const option = doc.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
      audioSelect.appendChild(option);
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
}

function getStream() {
  if (win.stream) {
    win.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    video: { width: { exact: 640 }, height: { exact: 480 }, deviceId: videoSource ? { exact: videoSource } : undefined }
  };
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {
  win.stream = stream;
  audioSelect.selectedIndex = [...audioSelect.options].findIndex(
    option => option.text === stream.getAudioTracks()[0].label
  );
  videoSelect.selectedIndex = [...videoSelect.options].findIndex(
    option => option.text === stream.getVideoTracks()[0].label
  );
  videoElement.srcObject = stream;
  socket.emit("broadcaster", hostkey);
}

function handleError(error) {
  console.error("Error: ", error);
}

