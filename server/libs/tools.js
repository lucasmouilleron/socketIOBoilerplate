//////////////////////////////////////////////////////////////
var colors = require("colors");
var moment = require("moment");
var fs = require("fs");
var map = require("array-map");
var DEBUG = false;

//////////////////////////////////////////////////////////////
module.exports = {

    init: function(debug) {
        DEBUG = debug;
        return this;
    },

    findClientsSocketByRoomId: function(io, roomId) {
        var res = []
        , room = io.sockets.adapter.rooms[roomId];
        if (room) {
            for (var id in room) {
                res.push(io.sockets.adapter.nsp.connected[id]);
            }
        }
        return res;
    },

    debug: function() {
        if(DEBUG) {
            message = this.stringifyArgs(this.getArgsArray(arguments)).join(" / ");
            message = "[DBG] "+moment().format("YYYY/MM/DD - HH:mm:ss")+" - "+message;
            console.log(message.blue);
        }
    },

    info: function() {
        message = this.stringifyArgs(this.getArgsArray(arguments)).join(" / ");
        message = "[NFO] "+moment().format("YYYY/MM/DD - HH:mm:ss")+" - "+message;
        console.log(message.green);
    },

    warn: function() {
        message = this.stringifyArgs(this.getArgsArray(arguments)).join(" / ");
        message = "[WRN] "+moment().format("YYYY/MM/DD - HH:mm:ss")+" - "+message;
        console.log(message.yellow);
    },

    error: function() {
        message = this.stringifyArgs(this.getArgsArray(arguments)).join(" / ");
        message = "[ERR] "+moment().format("YYYY/MM/DD - HH:mm:ss")+" - "+message;
        console.log(message.red);
    },

    getArgsArray: function(arguments) {
        args = [];
        for (i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        return args;
    },

    stringifyArgs: function(anArray) {
        return map(anArray, function(item) {
            if(item.constructor == String)
                return item;
            if(typeof anArray === "object")
                return JSON.stringify(item);
            return item;
        });
    },

    getObjectKeys: function(obj) {
        console.log(obj);
        var keys = [];
        for(var k in obj) {
            keys.push(k)
        };
        return keys;
    }
}
