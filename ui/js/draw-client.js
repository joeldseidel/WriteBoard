if(!"WebSocket" in window){
    alert("WebSockets is not supported in this browser");
}
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
//Define the default tool to be a black pen, normal sized
var tool = {
    type : "pen",
    color : "#000",
    size : 8
};

var clients = [];
var drawConn = new WebSocket("ws://localhost:8080/draw");

var toolEditMenuOpen = false;

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
    handleCommand(e.data);
};

var mouseDown = false;

canvas.onmousedown = function(e){
    e.preventDefault();
    mouseDown = true;
    var mouseLoc = {x : e.pageX, y: e.pageY};
    if(e.which === 1){
        if(toolEditMenuOpen) {
            toggleEditMenu(mouseLoc);
        } else {
            startLineDraw(mouseLoc);
        }
    } else if(e.which === 3){
        if(toolEditMenuOpen){
            redrawEditMenu(mouseLoc);
        } else {
            toggleEditMenu(mouseLoc);
        }
    }
};
canvas.onmousemove = function(e) {
    e.preventDefault();
    if (mouseDown) {
        var mouseLoc = {x: e.pageX, y : e.pageY};
        lineDraw(mouseLoc);
    }
};
canvas.onmouseup = function(e){
    e.preventDefault();
    var mouseLoc = {x : e.pageX, y : e.pageY};
    if(mouseDown){
        //Stop drawing the current line if the mouse was down
        stopLineDraw(mouseLoc);
        mouseDown = false;
    }
};
canvas.onmouseout = function(e){
    e.preventDefault();
    var mouseLoc = {x : e.pageX, y : e.pageY};
    if(mouseDown){
        //Stop drawing the current line if the mouse was down
        stopLineDraw(mouseLoc);
        mouseDown = false;
    }
};
canvas.addEventListener("wheel", function(e){
    handleScale(e);
});
function startLineDraw(loc){
    //The path that needs to be started
    var thisLine;
    if(tool.type === "pen"){
        //Start a new pen drawing path
        thisLine = { color : tool.color, size: tool.size, points: [], type: 'pen'};
        emitNewLine(thisLine, loc);
    } else if(tool.type === "eraser") {
        //Start a new eraser drawing path
        thisLine = { color : '#ffffff', size: tool.size, points: [], type: 'eraser'};
        emitNewLine(thisLine, loc);
    }
}

function emitNewLine(thisLine, loc){
    //Add the current point to the path array
    var cmd = {type : "new-path", path : thisLine};
    //Announce that there is a new path
    drawConn.send(JSON.stringify(cmd));
    cmd = {type: "update-draw", point: loc};
    //Announce that an update draw is needed for this point
    drawConn.send(JSON.stringify(cmd));
}

function lineDraw(loc){
    //Add more points to a line
    var cmd = {
        type : "update-draw",
        point : loc
    };
    drawConn.send(JSON.stringify(cmd));
}

function stopLineDraw(loc){
    var cmd = {
        type : "update-draw",
        point : loc
    };
    //Send the final point to the server to be drawn
    drawConn.send(JSON.stringify(cmd));
    cmd = {
        type : "close-path"
    };
    //Tell everyone that the line is done
    drawConn.send(JSON.stringify(cmd));
}

function handleCommand(e){
    var drawCmd = JSON.parse(JSON.parse(e));
    var sendingClient;
    if(drawCmd.type === "new-path"){
        //Get the client corresponding to the sending client
        sendingClient = clients[drawCmd.id];
        //Push a new open path to the client path array
        sendingClient.paths.push({path : drawCmd.path, isDrawn : false});
    } else if(drawCmd.type === "update-draw") {
        //Draw a point to the client's open path
        sendingClient = clients[drawCmd.id];
        sendingClient.paths.forEach(function (path, i) {
            if (!path.isDrawn) {
                //This path needs to be drawn to, is open
                drawPoint(path.path, drawCmd.point);
                sendingClient.paths[i].path.points.push(drawCmd.point);
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
    } else if(drawCmd.type === "welcome"){
        //I just joined, who is already here?
        drawCmd.friendsHere.forEach(function(client){
            clients[client] = { id : client, paths : []};
        });
    }
}

var zoomSensitivity = 0.008;

function handleScale(e){
    var normalized;
    if(e.wheelDelta){
        normalized = (e.wheelDelta % 120) === 0 ? e.wheelDelta / 120 : e.wheelDelta / 12;
    } else {
        var delta = e.deltaY ? e.deltaY : e.detail;
        normalized = -(delta % 3 ? delta * 10 : delta / 3);
    }
    var point = {
        x: e.pageX,
        y: e.pageY
    };
    var canvasPoint = convertLocalToCanvasSpace(point);
    var worldPoint = convertCanvasToWorldSpace(canvasPoint);
    normalized *= zoomSensitivity;
    normalized += 1;
    if(normalized > 0){
        viewport.scale /= normalized;
    } else {
        viewport.scale *= normalized;
    }
    var scaledCanvasPoint = convertWorldToCanvasSpace(worldPoint);
    var pointDelta = {
        x: canvasPoint.x - scaledCanvasPoint.x,
        y: canvasPoint.y - scaledCanvasPoint.y
    };
    viewport.x -= pointDelta.x;
    viewport.y += pointDelta.y;
    redrawCanvas();
}

function redrawCanvas(){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    //Redraw everything from every client
    //TODO: ensure that this actually works from a performance standpoint
    //Redraw the paths of every client
    clients.forEach(function(client){
        //Redraw every one of this client's paths
        client.paths.forEach(function(path){
            //Redraw every point in this path
            context.save();
            context.translate(-viewport.x, viewport.y);
            context.scale(viewport.scale, viewport.scale);
            context.beginPath();
            context.strokeStyle = path.color;
            context.lineWidth = path.size;
            context.lineCap = 'round';
            path.path.points.forEach(function(point, i){
                point = convertCanvasToWorldSpace(convertLocalToCanvasSpace(point));
                if(i === 0){
                    //This is the first point in this line
                    context.moveTo(point.x + 0.5, point.y + 0.5);
                } else {
                    var lastPoint = path.path.points[i - 1];
                    lastPoint = convertCanvasToWorldSpace(convertLocalToCanvasSpace(lastPoint));
                    context.moveTo(lastPoint.x + 0.5, lastPoint.y + 0.5);
                }
                context.lineTo(point.x, point.y);
                context.stroke();
                context.restore();
            });
        });
    });
}

function drawPoint(path, point){
    point = convertCanvasToWorldSpace(convertLocalToCanvasSpace(point));
    //save the canvas context
    context.save();
    //Move the canvas origin according to user viewport
    context.translate(-viewport.x, viewport.y);
    //Change the canvas scale to reflect the user viewport zoom
    context.scale(viewport.scale, viewport.scale);
    context.beginPath();
    context.strokeStyle = path.color;
    context.lineWidth = path.size;
    context.lineCap = 'round';
    var points = path.points;
    if(points.length === 0){
        //This is the first point so just move to its location
        context.moveTo(point.x + 0.5, point.y + 0.5);
        console.log("created a line at " + point.x + ", " + point.y);
    } else {
        //This is not the first point so move to the last drawn points location
        var lastPoint = path.points[path.points.length - 1];
        lastPoint = convertCanvasToWorldSpace(convertLocalToCanvasSpace(lastPoint));
        context.moveTo(lastPoint.x + 0.5, lastPoint.y + 0.5);
        console.log("drew a line from " + lastPoint.x + ", " + lastPoint.y + " to " + point.x + ", " + point.y);
    }
    //Draw the line to the current point
    context.lineTo(point.x + 0.5, point.y + 0.5);
    //Update the canvas element
    context.stroke();
    context.restore();
}

function convertWorldToLocalSpace(worldLoc){
    //TODO: convert the world space to the user's viewport
    //I don't know if this works, but it probably does
    var loc = clone(worldLoc);
    loc.x *= viewport.scale;
    loc.y *= viewport.scale;
    loc.x -= viewport.x;
    loc.y += viewport.y;
    return loc;
}

function convertCanvasToWorldSpace(localLoc){
    //TODO: convert the user's viewport to the world space
    //I also don't know if this one works, but it should
    var loc = clone(localLoc);
    loc.x += viewport.x;
    loc.y -= viewport.y;
    loc.x /= viewport.scale;
    loc.y /= viewport.scale;
    return loc;
}

function convertLocalToCanvasSpace(localLoc){
    var offset = $('#canvas').offset();
    var canvasX = localLoc.x - offset.left;
    var canvasY = localLoc.y - offset.top;
    return{
        x : canvasX,
        y : canvasY
    };
}

function convertWorldToCanvasSpace(worldLoc){
    var point = clone(worldLoc);//See above. This really *** pisses me off.
    point.x*=viewport.scale;
    point.y*=viewport.scale;
    point.x-=viewport.x;
    point.y+=viewport.y;
    return point;
}

function clone(obj){
    var copy;
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;
    copy = {};
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
}

window.onresize = function(){
    calibrateCanvas();
    //TODO: redraw all the lines
};

function calibrateCanvas(){
    var localCanvas = $('#canvas')[0];
    localCanvas.width = window.innerWidth;
    localCanvas.height = window.innerHeight;
}

window.onload = function(){
    calibrateCanvas();
};

$('.tool-option').click(function(){
    tool.type = $(this).data("toolname");
    if(toolEditMenuOpen){
        toggleEditMenu({x:0, y:0});
    }
});

$('.tool-edit-option').click(function(){
    var editAttr = $(this).data("editattr");
    //Close any others that might be open before opening a new one
    $('.edit-tool-submenu').css("display", "none");
    if(editAttr === "close"){
        //They clicked the close button, just close everything and move on
        toggleEditMenu({x:0,y:0});
    } else {
        //The user selected a sub menu
        handleEditTool(editAttr);
    }
});

function toggleEditMenu(loc){
    var toolEditMenu = $('#tool-edit-menu');
    var contextMenu;
    switch(tool.type){
        case "pen":
            contextMenu = $('#edit-pen-tool');
            break;
        case "eraser":
            contextMenu = $('#edit-eraser-tool');
            break;
        default: return;
    }
    if(!toolEditMenuOpen){
        //Tool edit menu is not open, but it needs to be
        toolEditMenu.css("display", "block");
        contextMenu.css("display", "block");
        redrawEditMenu(loc);
        toolEditMenuOpen = true;
    } else {
        //Tool edit menu is open, but it needs to not be
        toolEditMenu.css("display", "none");
        contextMenu.css("display", "none");
        //Close any open sub menus
        $('.edit-tool-submenu').css("display", "none");
        $('.tool-edit-option').css("display", "none");
        toolEditMenuOpen = false;
    }
}

function redrawEditMenu(loc){
    var toolEditMenu = $('#tool-edit-menu');
    toolEditMenu.css("top", loc.y - 50);
    toolEditMenu.css("left", loc.x + 1);
    redrawEditTool();
}

function redrawEditTool(){
    var editTool = $('.edit-tool-submenu');
    var toolEditMenu = $('#tool-edit-menu');
    editTool.css("top", toolEditMenu.position().top);
    editTool.css("left", (toolEditMenu.position().left + toolEditMenu.width() + 25));
}

function handleEditTool(attr){
    //Someone clicked an option within
    if(tool.type === "pen"){
        if(attr === "color"){
            $('#color-options').css("display", "block");
            redrawEditTool();
        } else if(attr === "size") {
            $('#size-options').css("display", "block");
        }
    } else if(tool.type === "eraser"){
        //Don't need to adjust the color of the eraser because it is always white
        if(attr === "size"){

            $('#size-options').css("display", "block");
        }
    } else if(tool.type === "text"){
        if(attr === "color"){
            $('#color-options').css("display", "block");
            redrawEditTool();
        } else if(attr === "size"){
            $('#size-options').css("display", "block");
        }
    } else if(tool.type === "image"){
    }
}

$('.color-option').click(function(){
    tool.color = $(this).data("color");
    //Close the color options menu
    $('#color-options').css("display", "none");
    toggleEditMenu({x: 0, y: 0});
});
//This is hacked up but somehow works :)
$(document).on('change', '#size-slider', function(){
    tool.size = $(this).val();
    $('#size-options').css("display", "none");
    toggleEditMenu({x: 0, y: 0});
});