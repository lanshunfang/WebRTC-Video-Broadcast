const doc = document;
const win = window;

class UserList {
	constructor(config) {
		this._config = config;
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

		let stream = win.stream;
		stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

		peerConnection.onicecandidate = event => {
			if (event.candidate) {
				// config.socket.emit("candidate", id, event.candidate);
				config.socket.emit("candidate", {
					id: id,
					candidate: event.candidate
				});
			}
		};

		peerConnection
			.createOffer()
			.then(sdp => peerConnection.setLocalDescription(sdp))
			.then(() => {
				config.socket.emit("offer", {
					streamerId: this._config.socket.id,
					watcherId: id,
					msg: peerConnection.localDescription,
					broadcasterName: config.fullname
				});
			});
		notify(`用户加入：${this._users[id].watcherObj.fullname}`);
		this.updateWatcherList();
	}

	updateWatcherList() {
		const container = doc.querySelector('.watcher-list');
		if (!container) {
			return;
		}
		const users = Object.values(this._users)
			.sort((a, b) => a.id === b.id ? 0 : (a.id > b.id ? -1 : 1));
		const usersHtml = users
			.map(
				user => `<li id="${user.id}">${user.watcherObj.fullname}</li>`
			)
			.join('');

		container.innerHTML = usersHtml;

		const usercount = doc.querySelector('.user-count');
		if (usercount) {
			usercount.innerText = users.length;
		}


	}

	setUserAnswer(id, description) {
		this._users[id].peerConnection.setRemoteDescription(description);
	}

	disconnectUser(id) {
		this._users[id].peerConnection.close();
		notify(`用户离开：${this._users[id].watcherObj.fullname}`);
		delete this._users[id];
		this.updateWatcherList();
	}

	addCandidateToUser(id, candidate) {
		this._users[id].peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
	}
}

function setupSteamer(config, userlist) {
	config.socket.on("answer", (watchObj) => {
		userlist.setUserAnswer(
			watchObj.watcherId,
			watchObj.localDescription,
		);
	});

	config.socket.on("watcher", watcherObj => {
		userlist.addUser(watcherObj);

	});

	config.socket.on("candidate", (candidateObj) => {
		userlist.addCandidateToUser(candidateObj.id, candidateObj.candidate);
	});

	config.socket.on("disconnectPeer", id => {
		userlist.disconnectUser(id);
	});

	win.onunload = win.onbeforeunload = () => {
		config.socket.close();
	};
}

function getUserInput(storagekey, msg, minlength = 6, maxretry = 3) {
	const defaultValue = getStorage(storagekey);
	let userinput;
	while (maxretry-- > 0 && (!userinput || userinput.length < minlength)) {
		userinput = prompt(msg, defaultValue || "");
	}
	setStorage(storagekey, userinput);
	return userinput;
}

const getStorage = (key, defaultValue) => {
	return localStorage.getItem(key) || defaultValue;
}
const setStorage = (key, val) => {
	localStorage.setItem(key, val);
}

let notificationClearerId;
function notify(msg, isChat = false) {
	// Let's check if the browser supports notifications
	if (!STATE.isTabFocused && "Notification" in window) {
		if (Notification.permission === "granted") {
			// If it's okay let's create a notification
			new Notification(msg);
		}

		// Otherwise, we need to ask the user for permission
		else if (Notification.permission !== "denied") {
			Notification.requestPermission().then(function (permission) {
				// If the user accepts, let's create a notification
				if (permission === "granted") {
					new Notification(msg);
				}
			});
		}
	}

	const newItm = doc.createElement('li');

	const notificationContainer = doc.querySelector(
		isChat ? '.chat-view' : '.notification'
	);

	notificationContainer.appendChild(newItm);
	newItm.innerHTML = msg;
	notificationContainer.scrollTop = notificationContainer.scrollHeight;

	if (!isChat) {
		notificationContainer.classList.remove('hide');
		clearTimeout(notificationClearerId);
		notificationClearerId = setTimeout(
			() => {
				notificationContainer.innerHTML = "";
				notificationContainer.classList.add('hide');
			},
			10000
		);
	}

}

function toggleElement(selector1, selector2, isSwitchSelector) {

	if (isSwitchSelector) {
		[selector1, selector2] = [selector2, selector1];
	}

	doc.querySelector(selector1).classList.add('hide');
	doc.querySelector(selector2).classList.remove('hide');
}