window.onload = function() {
 
    var messages = [];
    var socket = io.connect('http://192.168.14.186:8080');
    var field = document.getElementById("sendField");
    var sendButton = document.getElementById("sendButton");
    var content = document.getElementById("chatContent");
    var userName;
    socket.on('message', function (data) {
        if(!data.username)
            data.username = userName;
        AppendOnChat("<p><b>"+data.username+"</b>: "+data.message+"</p>");
    });
    
    socket.on('handshake', function(data){
        userName = prompt("Enter your name : ");
        socket.emit('handshake', { username: userName});
    });

    socket.on('newUser', function (data) {
       AppendOnChat("<p>Connesso nuovo utente <b>"+data.username+"</b></p>");
    }); 

    socket.on('leaveUser', function (data) {
        AppendOnChat("<p><b>"+data.username+"</b> ha abbandonato la chat.");
    }); 

    sendButton.onclick = function() {
        var text = field.value;
        socket.emit('send', { message: text });
    };
}

function AppendOnChat(message){
    $("#chatContent").append(message);
    $("#chatContent").scrollTop($("#chatContent").scrollTop()+1000);
}