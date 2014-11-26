/////////////////////////////////////////////////////////////////////
// REQUIREJS CONFIG
/////////////////////////////////////////////////////////////////////
require.config({
    paths: {
        "jquery": "libs/vendor/jquery/dist/jquery",
        "bootstrap": "libs/vendor/bootstrap/dist/js/bootstrap.min",
        "console": "libs/vendor/console/console.min",
        "throbber": "libs/vendor/throbber.js/throbber",
        "socketio": "libs/socket-io-client",
        "notify": "libs/vendor/notifyjs/dist/notify",
        "notify-bootstrap": "libs/vendor/notifyjs/dist/styles/bootstrap/notify-bootstrap",
        "tools": "libs/tools",
        "config": "libs/config"
    },
    shim: {
        "bootstrap": ["jquery"],
        "throbber": ["jquery"],
        "notify": ["jquery"],
        "notify-bootstrap": ["notify"],
        "tools": ["jquery", "console"]
    }
});

/////////////////////////////////////////////////////////////////////
// ENTRY POINT
/////////////////////////////////////////////////////////////////////
require(["jquery", "tools", "socketio","bootstrap","config","notify-bootstrap"], function($, tools, io) {
    $(function() {

        var roomID = undefined;
        var socketRoom = undefined;
        var socket = undefined;
        var lat = undefined;
        var long = undefined;

        initGeolocation();
        initSocket();

        $("#turnOff").click(function() {
            socketRoom.emit("action-room", {"action":"turn-off"});
            $.notify("Action room sent", "success");
        });

        $("#turnOn").click(function() {
            socketRoom.emit("action-room", {"action":"turn-on"});
            $.notify("Action room sent", "success");
        });

        $("#dropBomb").click(function() {
            if(lat != undefined && long != undefined) {
                socket.emit("drop-bomb", {"lat":lat,"long":long}, function(ack) {
                    $.notify("Bomb dropped", "success");
                });
            }
            else {
                $.notify("Can't drop bomb, not geolocated yet", "error");
            }
        });

        var roomIDGet = tools.getQueryParams().roomID;
        if(roomIDGet !== undefined) {
            roomID = roomIDGet;
            initSocketRoom();
        }

        $("#submitRoomID").click(function() {
            roomID = $("#roomIDInput").val();
            initSocketRoom();
        });

        function shutdownSocket() {
            $("#joinInForm").fadeIn();
            $("#roomIDConsole").fadeOut();
            $("#actions").fadeOut();
            $("#room-actions").fadeOut();
            $("#roomID").html("...");
            socketRoom = undefined;
            roomID = undefined;
        }

        function initSocket() {
            if(socket !== undefined) return;

            $.notify("Joining in", "info");
            socket = io(SOCKET_IO_HOST+":"+SOCKET_IO_PORT, {"forceNew":true });
            socket.on("connect", function(){
                $("#global-socket-id").html(socket.io.engine.id);
                $("#actions").hide().removeClass("hidden").fadeIn();    
                $.notify("You joined in", "success");
            });
        }

        function initSocketRoom() {
            if(socketRoom !== undefined || roomID === undefined || roomID === "") return;

            $.notify("Joining room "+roomID, "info");
            socketRoom = io(SOCKET_IO_HOST+":"+SOCKET_IO_PORT, {"forceNew":true });
            socketRoom.on("connect", function(client){
                $("#room-socket-id").html(socketRoom.io.engine.id);
                socketRoom.emit("join-room", {"roomID":roomID,"jwt":"todo"}, function(ack) {
                    if(ack) {
                        $("#joinInForm").fadeOut();
                        $("#roomIDConsole").hide().removeClass("hidden").fadeIn();
                        $("#room-actions").hide().removeClass("hidden").fadeIn();
                        $("#roomID").html(roomID);
                        $.notify("You joined in", "success");
                    }
                });

                socketRoom.on("no-more-master", function(data) {
                    shutdownSocket();
                    $.notify("No more masters allowed", "warn");
                });

                socketRoom.on("disconnect", function(){});

            });
        }

        function initGeolocation()
        {
            if(navigator.geolocation)
            {
                $.notify("Geolocating", "warn");
                navigator.geolocation.watchPosition(success, fail);
            }
            else
            {
                alert("Sorry, your browser does not support geolocation services.");
            }

            function success(position)
            {
                lat = position.coords.latitude;
                long = position.coords.longitude;
                $.notify("Geolocated", "success");
                if(socket != undefined) {
                    socket.emit("do-i-explode", {"lat":lat,"long":long}, function(ack) {
                        if(ack.boom) {
                            $.notify("BOOOOOMMMM !!!! - "+ack.owner, "warn");
                        }
                    });
                }
            }

            function fail(a,b)
            {
                //alert("Geoloc error : "+a);
            }
        }
        
    });
});