//TODO: implement the magic in here

if(!"WebSocket" in window){
    alert("WebSockets is not supported in this browser");
}
var username = getUsernameArg();
var chatElement = $('#chat-view');
var chatConn = new WebSocket("ws://localhost:8080/chat");

chatConn.onopen = function(){
    chatConn.send(username);
};

chatConn.onmessage = function(e){
    formatChatMessage(e);
}

chatConn.onclose = function(){
    //Send I left the chat message as type event
};

function getUsernameArg(){
    var usernameParam = window.location.search.replace("?", '');
    return usernameParam.replace("username=", '');
}

function formatChatMessage(e){
    var message = JSON.parse(e.data);
    var messageElement = $('<div class="chat-message"></div>');
    if(message.type === "event"){
        //Something happened. Someone joined or left
        messageElement.addClass("evt");
    } else {
        //Someone said something
        messageElement.addClass("msg");
    }
    var usernameElement = $('<p class="chat-username"></p>');
    usernameElement.text(message.user);
    usernameElement.appendTo(messageElement);
    var textElement = $('<p class="chat-body"></p>');
    textElement.text(message.msg);
    textElement.appendTo(messageElement);
    usernameElement.appendTo(chatElement);
}