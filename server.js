const fs = require('fs');
const express = require("express");
const app = express();
const { execSync } = require("child_process");

let broadcaster;
const port = 4000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));

const turnuserlist = process.env.TURN_USERS;

const turnusers = (turnuserlist || execSync("turnadmin -l").toString()).split("\n").filter(val => !!val);

if (!turnusers.length) {
	console.error("You should install coturn and add user via turnadmin before continue")
	return;
}

let hostkey;
try {
	hostkey = fs.readFileSync('./host-token', 'utf8')
	console.log(`[INFO] Found host key ${hostkey}`)
} catch (err) {
	console.error(err)
}

if (!hostkey || hostkey.length < 6) {
	console.error("[ERROR] Must set host key in file ./host-token with at least 6 letters");
	return
}

io.use((socket, next) => {
	console.log(`[INFO] a client connented to default ns / started`)
	next();
});

turnusers.forEach(
	ns => {
		ns = "/" + encodeURIComponent(ns)
		console.log(`[INFO] Add sever in ns ${ns}`)
		ions = io.of(ns);
		ions.use((socket, next) => {
			console.log(`[INFO] NS started ${ns}`)
			next();
		});
		ions.on("error", e => console.log(e));
		ions.on("connection", socket => {
			console.log(`[INFO] NS connected ${ns}`)
			socket.on("broadcaster", (senthostkey) => {
				if (!senthostkey || senthostkey.trim() !== hostkey.trim()) {
					console.error(`[WARN] Reject broadcaster due to wrong hostkey ${senthostkey} from client ${socket.id}`);
					return
				}
				broadcaster = socket.id;
				console.log(`[INFO] Broadcaster connected at ${broadcaster}`)
				socket.broadcast.emit("broadcaster");
			});
			socket.on("watcher", (watcherObj) => {
				console.log(`[INFO] Watcher connected at ${socket.id}`)
				socket.to(broadcaster).emit("watcher", watcherObj);
			});
			socket.on("offer", (data) => {
				socket.to(data.id).emit("offer", {
					...data,
					id: socket.id,
				});
			});
			socket.on("answer", (id, message) => {
				socket.to(id).emit("answer", socket.id, message);
			});
			socket.on("candidate", (id, message) => {
				socket.to(id).emit("candidate", socket.id, message);
			});
			socket.on("disconnect", () => {
				console.log(`[INFO] Watcher disconnected at ${socket.id}`)
				socket.to(broadcaster).emit("disconnectPeer", socket.id);
			});
		});
	}
);


server.listen(port, () => console.log(`Server is running on port ${port}`));
