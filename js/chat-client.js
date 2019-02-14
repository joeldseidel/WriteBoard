if(!"WebSocket" in window){
    alert("WebSockets is not supported in this browser");
}
var username = getUsernameArg();
var chatElement = $('#chat-view');
var chatConn = new WebSocket("ws://localhost:8080/chat");
var chatShown = true;

chatConn.onopen = function(){
    chatConn.send(username);
};

chatConn.onmessage = function(e){
    formatChatMessage(e);
};

$(document).ready(function(){
    var sendChatButton = $('#send-chat-button');
    var chatInput = $('#chat-input');
    var minChat = $('#close-chat-button');
    var openChat = $('#open-chat');
    chatInput.keypress(function (e) {
        var key = e.which;
        if(key === 13){
            sendChatButton.click();
            return false;
        }
    });
    sendChatButton.click(function(){
        var msg = chatInput.val();
        chatConn.send(msg);
        chatInput.val('');
    });
    minChat.click(function(){
        var chat = $('#chat');
        var minichat = $('#mini-chat');
        chat.slideToggle();
        minichat.css("display", "block");
        chatShown = false;
    });
    openChat.click(function(){
        var chat = $('#chat');
        var minichat = $('#mini-chat');
        minichat.css("display", "none");
        chat.slideToggle();
        chatShown = true;
    });
});

function getUsernameArg(){
    var usernameParam = window.location.search.replace("?", '');
    return usernameParam.replace("username=", '');
}

//Initially -1 because the first "message" from the server is the chat log
//Therefore after receiving the logs, there will be 0 messages in the chat
var messageCount = -1;

function formatChatMessage(e){
    var message = JSON.parse(e.data);
    var messageElement = $('<div class="chat-message"></div>');
    if(messageCount === -1){
        //This is the log object
        //TODO: foreach the existing messages and format accordingly
        messageCount++;
        return;
    }
    if(message.type === "event"){
        //Something happened. Someone joined or left
        messageElement.addClass("evt");
        var eventReportElement = $('<p class="chat-event"></p>');
        eventReportElement.text(message.user + " " + message.msg);
        eventReportElement.appendTo(messageElement);
    } else {
        //Someone said something
        messageElement.addClass("msg");
        var usernameElement = $('<p class="chat-username"></p>');
        usernameElement.text(message.user);
        usernameElement.appendTo(messageElement);
        var textElement = $('<p class="chat-body"></p>');
        textElement.text(message.msg);
        textElement.appendTo(messageElement);
    }
    messageCount++;
    messageElement.appendTo(chatElement);
}
