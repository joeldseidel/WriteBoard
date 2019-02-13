//TODO: implement the magic in here

if(!"WebSocket" in window){
    alert("WebSockets is not supported in this browser");
}
var username = getUsernameArg();
var chatConn = new WebSocket("ws://localhost:8080/chat");

chatConn.onopen = function(){
    chatConn.send(username);
};

chatConn.onmessage = formatChatMessage(evt);

chatConn.onclose = function(){
    //Send I left the chat message as type event
};

function getUsernameArg(){
    var usernameParam = window.location.search.replace("?", '');
    return usernameParam.replace("username=", '');
}

function formatChatMessage(evt){
    var message = JSON.parse(evt.data);
    var messageElement = $('<div class="chat-message"></div>');
    if(message.type === "event"){
        //Something happened. Someone joined or left
    } else {
        //Someone said something
    }
}