$(document).ready(function() {
    var socket = io();
    //
    // listener, whenever the server emits 'updatechat', this updates the chat body
    socket.on('updatechat', function(data) {
        $('#title').append(data);
        console.log(data);
        $('.chatting').removeClass('hidden');
        $('.start-chat').addClass('hidden');
    });
    // listener, whenever the server emits 'updatechat', this updates the chat body
    socket.on('updateroomchat', function(username, data) {
        console.log(data);
        $('.room-chatting').removeClass('hidden');
        $('.chatting, .start-chat').addClass('hidden');
        if (username === 'SERVER') {
            $('.server-notification').append('<label><b>' + username + ':</b> ' + data + '</label><br>');
            //$('.server-notification').scrollTop(100);
            if ($('.server-notification>label').length > 5) {
                $('.server-notification').animate({
                    scrollTop: 100 + ($('.server-notification>label').length * 10)
                });
            }
        } else {
            $('#conversation').append('<label><b>' + username + ':</b> ' + data + '</label><br>');
            if ($('#conversation>label').length > 14) {
                $('#conversation').animate({
                    scrollTop: 100 + ($('#conversation>label').length * 10)
                });
            }
        }
                
    });
    //
    // listener, whenever the server emits 'updaterooms', this updates the room the client is in
    socket.on('updaterooms', function (rooms, currentRoom) {
        $('#rooms').empty();
        $.each(rooms, function (key, value) {
            if (value == currentRoom) {
                $('#rooms').append('<div class="col-sm-1 col-xs-2" title="Hey! this is your active room"><a class="btn btn-xs btn-success switch-rooms disabled" data-room="' + value + '">' + value + '</a></div>');
            }
            else {
                $('#rooms').append('<div  class="col-sm-1 col-xs-2" title="Wanna Join me ??"><a class="btn btn-xs btn-info switch-rooms" data-room="' + value + '">' + value + '</a></div>');
            }
        });
    });
    //
    socket.on('chat message', function (msg) {
        $('#messages').append($('<li class="' + (msg.username === $('#username').val() ? 'my-msg' : 'fnds-msg') + '">').html('<b>' + msg.username + ': </b>' + msg.msg + '<span></span>'));
        if ($('#messages>li').length > 11) {
            $('#messages').animate({
                scrollTop: 100 + ($('#messages>li').length * 10)
            });
        }
    });
    //
    socket.on('typing', function (msg) {
        $('#userTyping').html(msg + " is typing...").fadeIn().fadeOut();
    });
    //
    socket.on('broadcast', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });
    //
    $('.join-room').off('click').on('click', function () {
        if ($('#room_username').val() === '') {
            alert('Username is required to join room chat');
            return false;
        }
        var req = {
            name: $('#room_username').val(),
            room: $(this).attr('id')
        };
        // call the server-side function 'joinroom' and send one object
        socket.emit('joinroom', req);
    });
    //
    $(document).off('click').on('click', '.switch-rooms', function () {
        socket.emit('switchRoom', $(this).data('room'));
    });
    //
    $('#userRegister').off('click').on('click', function () {
        socket.emit('adduser', $('#username').val());
    });
    //
    $('form').submit(function () {
        if ($('#username').val() === '') {
            alert('Username is required to chat..');
            $('#username').focus();
            return false;
        }
        var req = {
            username: $('#username').val(),
            msg: $('#msg').val()
        };
        socket.emit('chat message', req);
        $('#msg').val('');
        //
        //Needed if you user broadcast at server end to append self messages
        //$('#messages').append($('<li class="keep-left">').html('<b>' + req.username + ': </b>' + req.msg));
        return false;
    });
    //
    $('#msg').on('keypress', function () {
        if ($(this).val().length % 3 == 0) {
            socket.emit('typing', $('#username').val());
        }
    });
    //
    // When the client clicks Room Chat send button
    //
    $('#sendRoomChat').off('click').on('click', function() {
        var message = $('#roomChatMessage').val();
        $('#roomChatMessage').val('');
        // tell server to execute 'room chat' and send along one parameter
        socket.emit('room chat', message);
    });
    // when the client hits ENTER on their keyboard
    $('#roomChatMessage').on('keypress',function (e) {
        if (e.which == 13) {
            $('#sendRoomChat').trigger('click');
        }
    });
});