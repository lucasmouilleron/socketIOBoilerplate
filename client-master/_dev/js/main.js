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
        var socket = undefined;

        $("#turnOff").click(function() {
            socket.emit("action", {"action":"turn-off"});
            $.notify("Action sent", "success");
        });

        $("#turnOn").click(function() {
            socket.emit("action", {"action":"turn-on"});
            $.notify("Action sent", "success");
        });

        var roomIDGet = tools.getQueryParams().roomID;
        if(roomIDGet !== undefined) {
            roomID = roomIDGet;
            initSocket();
        }

        $("#submitRoomID").click(function() {
            roomID = $("#roomIDInput").val();
            initSocket();
        });

        function shutdownSocket() {
            $("#joinInForm").fadeIn();
            $("#roomIDConsole").fadeOut();
            $("#actions").fadeOut();
            $("#roomID").html("...");
            socket = undefined;
            roomID = undefined;
        }

        function initSocket() {
            if(socket !== undefined || roomID === undefined || roomID === "") return;

            $.notify("Joining in", "info");
            socket = io(SOCKET_IO_HOST+":"+SOCKET_IO_PORT, {"forceNew":true });
            tools.displayMainLoader();
            socket.on("connect", function(){

                socket.emit("join-room", {"roomID":roomID,"jwt":"todo"}, function(ack) {
                    tools.hideMainLoader();
                    if(ack) {
                        $("#joinInForm").fadeOut();
                        $("#roomIDConsole").hide().removeClass("hidden").fadeIn();
                        $("#actions").hide().removeClass("hidden").fadeIn();
                        $("#roomID").html(roomID);
                        $.notify("You joined in", "success");
                    }
                });

                socket.on("no-more-master", function(data) {
                    shutdownSocket();
                    $.notify("No more masters allowed", "warn");
                });

                socket.on("disconnect", function(){});

            });
        }
        
    });
});