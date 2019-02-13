var mouseDown = false;
var canvas = $('#canvas');
var tool = 'pen';

var drawConn = new WebSocket("ws://localhost:8080/draw");

drawConn.onopen = function(){
    //TODO: get already existing paths and points
};
drawConn.onmessage = function(e){
    handleDraw(e);
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
}

function lineDraw(loc) {
    //add more points to a line
}