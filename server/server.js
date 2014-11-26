//////////////////////////////////////////////////////////////
var config = require("./libs/config.json");
var DEBUG = config.debug;
var LAT_PRECISION = 0.01;
var LONG_PRECISION = 0.01;

//////////////////////////////////////////////////////////////
var io = require("socket.io")();
var tools = require("./libs/tools").init(DEBUG);

//////////////////////////////////////////////////////////////
var roomsSlaves = [];
var bombs = [];

//////////////////////////////////////////////////////////////
io.on("connection", function(socket){
	
	//////////////////////////////////////////////////////////////
	socket.on("join-room", function(data, ack) {
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

	//////////////////////////////////////////////////////////////
	socket.on("action-room", function(data) {
		// the room 0 is the socket default room
		var room = socket.rooms[1];
		var slaveSocket = roomsSlaves[room];
		if(slaveSocket === undefined) {
			tools.warn("no slave for room",room);
			socket.disconnect();
			return;
		}
		slaveSocket.emit("action-room",data);
		tools.info("action",data,"sent to room",room,"slave",slaveSocket.id);
	});

	//////////////////////////////////////////////////////////////
	socket.on("drop-bomb", function(data, ack) {
		bombs.push({"lat":data.lat,"long":data.long,"owner":socket.id,"exploded":false});
		tools.info("bom dropped",bombs[bombs.length-1]);
		if(ack) ack(true);
	});

	//////////////////////////////////////////////////////////////
	socket.on("do-i-explode", function(data, ack) {

		var boomBombIndex = -1;
		var bomb = undefined;
		for (var i = 0; i < bombs.length; i++) {
			bomb = bombs[i];
			if(!bomb.exploded && bomb.owner != socket.id) {
				if((data.lat >= bomb.lat - LAT_PRECISION && data.lat <= bomb.lat + LAT_PRECISION) && (data.long >= bomb.long - LONG_PRECISION && data.long <= bomb.long + LONG_PRECISION)) {
					boomBombIndex = i;
				}
				break;
			}
		}
		if(boomBombIndex != -1) {
			bomb.exploded = true;
			bombs[boomBombIndex] = bomb;
			if(ack) ack({"boom":true,"owner":bomb.owner});
			tools.info("bomb exploded","bomb index",boomBombIndex);
			tools.debug("bombs",bombs);
		}
		else {
			if(ack) ack({"boom":false});
		}
		
	});

});

io.listen(config.socketIOPort);
tools.info("server started","port",config.socketIOPort);