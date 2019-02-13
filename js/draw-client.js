var canvas = $('#canvas');
var context = canvas.getContext("2d");
var tool = 'pen';

var clients = [];
var drawConn = new WebSocket("ws://localhost:8080/draw");

var viewport = {
    x : 0,
    y : 0,
    scale : 1
};

drawConn.onopen = function(){
    //TODO: get already existing paths and points
    var openArgs = { type : "new-client" };
    drawConn.send(JSON.stringify(openArgs));
};
drawConn.onmessage = function(e){
    handleCommand(e);
};
drawConn.onclose = function(e){
    //TODO: tell the server I am leaving so the clients can free up my client mem allocation
};

var mouseDown = false;

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
}

function lineDraw(loc) {
    //add more points to a line
}

function handleCommand(e){
    var drawCmd = JSON.parse(e);
    var sendingClient;
    if(drawCmd.type === "new-path"){
        //Get the client corresponding to the sending client
        sendingClient = clients[drawCmd.id];
        //Push a new open path to the client path array
        sendingClient.paths.push({path : drawCmd.path, isDrawn : false});
    } else if(drawCmd.type === "update-draw") {
        //Draw a point to the client's open path
        sendingClient = clients[drawCmd.id];
        sendingClient.paths.forEach(function (path) {
            if (!path.isDrawn) {
                //This path needs to be drawn to, is open
                drawPoint(path, drawCmd.point);
            }
        });
    } else if(drawCmd.type === "close-path") {
        //Close an open path of a client, they are done with this line
        sendingClient = clients[drawCmd.id];
        sendingClient.paths.forEach(function(path){
            if(!path.isDrawn){
                //This is the open path. Close it
                path.isDrawn = true;
            }
        });
    } else if(drawCmd.type === "new-client") {
        //Register the new client with the user who just joined
        clients[drawCmd.id] = { id : drawCmd.id, paths : [] };
    }
}

function drawPoint(){
    //TODO: draw the point that the server just told us to
    //save the canvas context
    context.save();
    
}

function convertToLocalSpace(worldLoc){
    //TODO: convert the world space to the user's viewport
    //I don't know if this works, but it probably does
    var loc = clone(worldLoc);
    loc.x *= viewport.scale;
    loc.y *= viewport.scale;
    loc.x -= viewport.x;
    loc.y += viewport.y;
    return loc;
}

function convertToWorldSpace(localLoc){
    //TODO: convert the user's viewport to the world space
    //I also don't know if this one works, but it should
    var loc = clone(localLoc);
    loc.x += viewport.x;
    loc.y -= viewport.y;
    loc.x /= viewport.scale;
    loc.y /= viewport.scale;
    return loc;
}