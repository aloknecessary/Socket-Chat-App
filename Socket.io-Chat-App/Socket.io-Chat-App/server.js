var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var usernames = {};
// rooms which are currently available in chat
var rooms = ['room1', 'room2', 'room3', 'room4', 'room5'];
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
    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function (username) {
        // store the username in the socket session for this client
        socket.username = username;
        // store the room name in the socket session for this client
        //socket.room = 'room1';
        // add the client's username to the global list
        //usernames[username] = username;
        // send client to room 1
        //socket.join('room1');
        // echo to client they've connected
        socket.emit('updatechat', 'Welcome ' + username);
        // echo to room 1 that a person has connected to their room
        //socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
        //socket.emit('updaterooms', rooms, 'room1');
    });
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
    //
    // when the client emits 'joinroom', this listens and executes
    socket.on('joinroom', function (user) {
        // store the username in the socket session for this client
        socket.username = user.name;
        // store the room name in the socket session for this client
        socket.room = user.room;
        // add the client's username to the global list
        usernames[user.name] = user.name;
        // send client to room 1
        socket.join(user.room);
        // echo to client they've connected
        socket.emit('updateroomchat', 'SERVER', 'you are now connected to ' + user.room);
        // echo to room that a person has connected to their room
        socket.broadcast.to(user.room).emit('updateroomchat', 'SERVER', user.name + ' has connected to this room');
        socket.emit('updaterooms', rooms, user.room);
    });
    // when the client emits 'room chat', this listens and executes
    socket.on('room chat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.in(socket.room).emit('updateroomchat', socket.username, data);
    });
    //
    socket.on('switchRoom', function (newroom) {
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updateroomchat', 'SERVER', 'You are now connected to ' + newroom);
        // sent message to OLD room
        socket.broadcast.to(socket.room).emit('updateroomchat', 'SERVER', socket.username + ' has left this room');
        // update socket session room title
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updateroomchat', 'SERVER', socket.username + ' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });
	
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});