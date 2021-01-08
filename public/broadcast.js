const config = getConfig();

// Get camera and microphone
const videoElement = doc.querySelector("video");
const audioSelect = doc.querySelector("select#audioSource");
const videoSelect = doc.querySelector("select#videoSource");


let hostkey;

const userlist = new UserList();

if (config) {
  init();
}

function init() {
  hostkey = getUserInput("hostkey", "请输入主持人密码。", 6);

  setupSteamer(config, userlist);

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
  config.socket.emit("broadcaster", hostkey);
}

function handleError(error) {
  console.error("Error: ", error);
}

