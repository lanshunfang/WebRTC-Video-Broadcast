const doc = document;
const win = window;
let socket;

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