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

        var roomID = tools.makeID();
        $("#roomID").html(roomID);
        $("#qrCode").attr("src",GOOGLE_QR_CODE_API+encodeURI(CLIENT_MASTER_URL)+"?roomID="+roomID);
        console.log(GOOGLE_QR_CODE_API+encodeURI(CLIENT_MASTER_URL)+"?roomID="+roomID);

        $.notify("Joining in", "info");
        tools.displayMainLoader();
        var socket = io(SOCKET_IO_HOST+":"+SOCKET_IO_PORT);
        socket.on("connect", function(){

            tools.hideMainLoader();
            $.notify("You joined in", "success");
            socket.emit("join-room", {"roomID":roomID,"jwt":"todo"});

            socket.on("action", function(data){
                $.notify("Action recieved", "success");
                if(data.action === "turn-off") {
                    $("#black").hide().removeClass("hidden").fadeIn();
                }
                if(data.action === "turn-on") {
                    $("#black").fadeOut();
                }
            });

            socket.on("master-arrived", function(data) {
                $.notify("A master joined in", "info");
            });

            socket.on("disconnect", function(){});

        });
    });
});