initShared();
function submitChat(event) {
	const form = event.currentTarget;
	const formdata = new FormData(form);
	event.preventDefault();
	const content = formdata.get('chat-content');
	if (!content || !content.trim()) {
		return;
	}
	config.socket.emit("chat", {
		fullname: config.fullname,
		id: config.socket.id,
		content: content
	});
	form.querySelector('.chat-input').value = "";

}

function initShared() {
	config.socket.on("chat-receive", chatObj => {
		notify(`${chatObj.fullname}: ${chatObj.content}`, true);
	});

	tabFocusListen();

}

function tabFocusListen() {
	win.onfocus = onTabFocus;
	win.onblur = onTabBlur;
}

function onTabBlur() {
	STATE.isTabFocused = false;
}

function onTabFocus() {
	STATE.isTabFocused = true;
}
