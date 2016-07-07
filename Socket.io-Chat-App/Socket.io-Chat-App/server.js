var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
//
app.use('/scripts', express.static(__dirname + "/scripts"));
app.use('/css', express.static(path.join(__dirname, 'css')));
//
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    //
    console.log('a user connected on socket id : ' + socket.id);
    //
    // broadcast functionality sends to everybody connected except sender
    //socket.on('chat message', function (msg) {
    //    socket.broadcast.emit('chat message', msg);
    //});
    //
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
    //
    socket.on('broadcast', function (msg) {
        io.emit('chat message', msg);
    });
    //
    socket.on('typing', function(msg) {
        socket.broadcast.emit('typing', msg);
    });
    //
    socket.on('disconnect', function () {
        console.log('user disconnected on socket id : ' + socket.id);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});