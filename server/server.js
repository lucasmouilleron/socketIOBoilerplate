//////////////////////////////////////////////////////////////
var tools = require("./libs/tools");
var config = require("./libs/config.json");
var io = require("socket.io")();

//////////////////////////////////////////////////////////////
var roomsSlaves = [];

//////////////////////////////////////////////////////////////
io.on("connection", function(socket){
	
	var roo
	socket.on("join-room", function (data, ack) {
		var jwt = data.jwt;

		var nbClients = tools.findClientsSocketByRoomId(io, data.roomID).length;
		if(nbClients > config.socketMaxMastersPerRoom) {
			socket.emit("no-more-master");
			tools.warn("no more master slots for room",data.roomID);
			if(ack) ack(false);
			return;
		}
		socket.join(data.roomID);
		tools.info("joined room",data.roomID);
		var roomSlave = roomsSlaves[data.roomID];
		if(!roomSlave) {
			roomsSlaves[data.roomID] = socket;
			tools.info("the slave joined in", socket.id);
		}
		else {
			if(ack) ack(true);
			roomSlave.emit("master-arrived",{"id":socket.id});
			tools.info("a master joined in", socket.id);
		}
	});

	socket.on("action", function (data) {
		// the room 0 is the socket default room
		var room = socket.rooms[1];
		var slaveSocket = roomsSlaves[room];
		if(slaveSocket === undefined) {
			tools.warn("no slave for room",room);
			socket.disconnect();
			return;
		}
		slaveSocket.emit("action",data);
		tools.info("action",data,"sent to room",room,"slave",slaveSocket.id);	
	});

});

io.listen(config.socketIOPort);
tools.info("server started","port",config.socketIOPort);