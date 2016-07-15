$(document).ready(function () {
    var currUser = {};
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
        //console.log(data);
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
        $('#chat_rooms').empty();
        $.each(rooms, function (key, value) {
            if (value == currentRoom) {
                $('#chat_rooms').append('<div class="col-sm-1 col-xs-2" title="Hey! this is your active room"><a class="btn btn-xs btn-success switch-rooms disabled" data-room="' + value + '">' + value + '</a></div>');
            }
            else {
                $('#chat_rooms').append('<div  class="col-sm-1 col-xs-2" title="Wanna Join me ??"><a class="btn btn-xs btn-info switch-rooms" data-room="' + value + '">' + value + '</a></div>');
            }
        });
        bindRoomClickEvent();
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
    socket.on('update client list', function(users) {
        console.log(users);
        var activeUId = '';
        if ($('#online_users li.active').length == 1) {
            activeUId = $('#online_users li.active').attr('id');
        }
        $('#currUser').val(currUser.name);
        $('#online_users').empty();
        $.each(users, function (i, user) {
            if (user.uniqueId != currUser.uniqueId) {
                $('#online_users').append('<li id="' + user.uniqueId + '"><label>' + user.name + ' <span class="circle"></span></label></li>');    
            }
        });
        $('#online_users li[id="' + activeUId + '"]').addClass('active');
    });
    //
    socket.on('personal chat', function (response) {
        if ($('.start-personal-chat').hasClass('hidden')) {
            $('.start-personal-chat').removeClass('hidden');
            $('#online_users>li[id="' + response.fromUId + '"]').addClass('active');
            $('.start-personal-chat .server-notification').html('<label>' + response.fromUser + ' started chat with you</label>');
        }
        addPersonalChatMessageToDiv(response.fromUser, response.message);
    });
    //
    // jQuery Codes
    //
    function bindRoomClickEvent() {
        $('#chat_rooms .switch-rooms').off('click').on('click', function () {
            socket.emit('switchRoom', $(this).data('room'));
        });
    };
    //
    function addPersonalChatMessageToDiv(user, msg) {
        $('#personalConversation').append('<label><b>' + user + ':</b> ' + msg + '</label><br>');
        if ($('#personalConversation>label').length > 14) {
            $('#personalConversation').animate({
                scrollTop: 100 + ($('#personalConversation>label').length * 10)
            });
        }
    };
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
    //
    $('#personal_chat_start').off('click').on('click', function () {
        if ($('#personal_username').val() === '') {
            alert('Username is required to chat ');
            return false;
        }
        $('.personal-chat-room').removeClass('hidden');
        $('.start-chat').addClass('hidden');
        currUser = {
            name: $('#personal_username').val(),
            uniqueId: $('#personal_username').val() + new Date().getTime()
        };
        $('#welcome_chat_user').html('Welcome ' + currUser.name);
        // call the server-side function 'join personal chat' and send one object
        socket.emit('join personal chat', currUser);
        
    });
    //
    $(document).off('click').on('click', '#online_users li',function() {
        $('#online_users li').removeClass('active');
        $(this).addClass('active');
        $('.start-personal-chat').removeClass('hidden');
        $('.start-personal-chat .server-notification').html('<label>You started chat with ' + $(this).text() + '</label>');
    });
    //
    $('#sendPersonalChat').off('click').on('click', function () {
        var message = $('#personalChatMessage').val();
        $('#personalChatMessage').val('');
        addPersonalChatMessageToDiv("You", message);
        // tell server to execute 'room chat' and send along one parameter
        socket.emit('start personal chat',$('#online_users li.active').attr('id') ,message);
    });
    // when the client hits ENTER on their keyboard
    $('#personalChatMessage').on('keypress', function (e) {
        if (e.which == 13) {
            $('#sendPersonalChat').trigger('click');
        }
    });
});