if(!"WebSocket" in window){
    alert("WebSockets is not supported in this browser");
}
var username = getUsernameArg();
var chatElement = $('#chat-view');
var chatConn = new WebSocket("ws://18.191.68.244:8282/chat");
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
        if(msg !== ''){
            chatConn.send(msg);
            chatInput.val('');
        }
    });
    minChat.click(function(){
        var chat = $('#chat');
        var minichat = $('#mini-chat');
        chat.slideToggle();
        minichat.css("display", "block");
        if(screen.width <= 768){
            //Show the mobile drawing menus
            $('#mobile-tool-box').css("display", "block");
            $('#mobile-context').css("display", "block");
        }
        chatShown = false;
    });
    openChat.click(function(){
        var chat = $('#chat');
        var minichat = $('#mini-chat');
        minichat.css("display", "none");
        $('#mobile-tool-box').css("display", "none");
        $('#mobile-context').css("display", "none");
        chat.slideToggle();
        unreadMessageCount = 0;
        updateUnread();
        chatShown = true;
    });
});

function getUsernameArg(){
    var usernameParam = window.location.search.replace("?", '');
    usernameParam = usernameParam.replace("username=", '');
    usernameParam = usernameParam.replace("%20", ' ');
    return usernameParam;
}

//Initially -1 because the first "message" from the server is the chat log
//Therefore after receiving the logs, there will be 0 messages in the chat
var messageCount = -1;
var unreadMessageCount = 0;

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
    if(!chatShown){
        unreadMessageCount++;
        updateUnread();
    }
    messageCount++;
    messageElement.prependTo(chatElement);
}

function updateUnread(){
    var notification = $('#notifications');
    if(unreadMessageCount === 0){
        notification.text("");
    } else {
        notification.text(unreadMessageCount + " unread");
    }
}