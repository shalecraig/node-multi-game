var http    = require('http'),
    url     = require('url'),
    fs      = require('fs'),
    io      = require('socket.io'),
    express = require('express'),
    sys     = require('sys'),
    debug   = sys.debug,
    inspect = sys.inspect,
    Room    = require('./lib/room').Room,
    _       = require('underscore');

var app = express.createServer();

app.use(express.static(__dirname + '/public'));

app.get('/games/:id', function(req, res) {
    res.sendfile(__dirname + getView(req.params.id));
});

getView = function(path){
    return '/lib/games/' + path + '/' + path + '.html';
};

app.listen(8080);

io = io.listen(app);
//
// Game-Clients Logic
//

var rooms = {
    multiply: new Room('multiply'),
    sum: new Room('sum')
};

io.on('connection', function(client){
    client.on('message', function(message) {
        var room = rooms[message.game];
        if (room) {
            room.processMessage(client, message);
        } else {
            client.send({message: 'unrecognized message' + JSON.stringify(message)});
        }
    });

    client.on('disconnect', function(){
        client.broadcast({ announcement: client.sessionId + ' disconnected'});
        _.each(rooms, function(room) {
            room.removeUser(client.sessionId);
        });
    });
});
