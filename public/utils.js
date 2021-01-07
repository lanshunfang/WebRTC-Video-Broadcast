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