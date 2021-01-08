const doc = document;
const win = window;

function getUserInput(storagekey, msg, minlength = 6) {
	const defaultValue = getStorage(storagekey);
	let userinput;
	while (!userinput || userinput.length < minlength) {
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
function notifyMe(msg) {
	// Let's check if the browser supports notifications
	if ("Notification" in window) {
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

	const notificationContainer = doc.querySelector('.notification');
	notificationContainer.appendChild(newItm);
	newItm.innerHTML = msg;
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

function toggleElement(selector1, selector2, isSwitchSelector) {

	if (isSwitchSelector) {
		[selector1, selector2] = [selector2, selector1];
	}

	doc.querySelector(selector1).classList.add('hide');
	doc.querySelector(selector2).classList.remove('hide');
}