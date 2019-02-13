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
    //TODO: send "has left the change message"
};

$(document).ready(function(){
    var sendChatButton = $('#send-chat-button');
    var chatInput = $('#chat-input');
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

var mouseDown = false;
var canvas = $('#canvas');
var tool = 'pen';

var drawConn = new WebSocket("ws://localhost:8080/draw");

drawConn.onopen = function(){
    //TODO: get already existing paths and points
};
drawConn.onmessage = function(e){
    //TODO: take the sent points and draw them
};
drawConn.onclose = function(e){
    //TODO: nothing? maybe? Not sure yet
}

canvas.mousedown(function(e){
    e.preventDefault();
    mouseDown = true;
    var mouseLoc = {x : e.pageX, y: e.pageY};
    startLineDraw(mouseLoc);
});
canvas.mousemove(function(e) {
    e.preventDefault();
    if (mouseDown) {
        var mouseLoc = {x: e.pageX, y : e.pageY};
        lineDraw(mouseLoc);
    }
});
canvas.mouseup(function(e){
    e.preventDefault();
    if(mouseDown){
        mouseDown = false;
    }
});
canvas.mouseleave(function(e){
    e.preventDefault();
    if(mouseDown){
        mouseDown = false;
    }
});

function startLineDraw(loc){
    //The path that needs to be started
    var thisLine;
    if(tool === 'pen'){
        //Start a new pen drawing path
        thisLine = { color : tool.color, size: tool.size, points: [], type: 'pen'};
        emitLine(thisLine, loc);
    } else if(tool === 'erase') {
        //Start a new eraser drawing path
        thisLine = { color : 'ffffff', size: tool.size, points: [], type: 'eraser'};
        emitLine(thisLine, loc);
    }
}

function emitLine(thisLine, loc){
    //Add the current point to the path array
    thisLine.push(loc);
    var cmd = {type : "new-path", path : thisLine};
    //Announce that there is a new path
    drawConn.send(JSON.stringify(cmd));
    cmd = {type: "update-draw", point: loc};
    //Announce that an update draw is needed for this point
    drawConn.send(JSON.stringify(cmd));
    //TODO: have this drawn locally
}

function lineDraw(loc){
    //add more points to a line
}