import { Server as SocketIOServer } from "socket.io";

const socketIOServer = new SocketIOServer();

socketIOServer.on("connection", socket => {
	socket.emit("hello", "world");
	socket.on("hello", data => {
		socket.broadcast.emit("hello", data);
	});
});

export default socketIOServer;
