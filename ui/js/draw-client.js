if(!"WebSocket" in window){
    alert("WebSockets is not supported in this browser");
}
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
//Define the default tool to be a black pen, normal sized
var tool = {
    type : "pen",
    color : "#000",
    size : 8,
    font : "Roboto"
};
//Current mouse position for the keyboard shortcuts
var mousePoint = {
    x : 0,
    y :0
};

//Used for drawing
var clients = [];
//Things that are already drawm that are coming from back end data
var artifacts = [];
//My client id
var me = -1;
//var drawConn = new WebSocket("ws://18.191.68.244:8282/draw");
var drawConn = new WebSocket("ws://localhost:8282/draw");

var toolEditMenuOpen = false;

var viewport = {
    x : 0,
    y : 0,
    scale : 1
};

drawConn.onopen = function(){
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
    //Get the location of the mouse click within the window
    var mouseLoc = {x : e.pageX, y: e.pageY};
    if(e.which === 1){
        //Left click was clicked
        if(toolEditMenuOpen) {
            //User wants the edit tool menu to go away, not start drawing
            toggleEditMenu(mouseLoc);
        } else {
            //The user is ready to start drawing, needs to send these points as world space
            startLineDraw(mouseLoc);
        }
    } else if(e.which === 3){
        //Right click was clicked
        if(toolEditMenuOpen){
            //User is right clicking again, must want to move the position of the edit tool menu
            redrawEditMenu(mouseLoc);
        } else {
            //User is right clicking without the menu open, must want to open it
            toggleEditMenu(mouseLoc);
        }
    }
};
canvas.onmousemove = function(e) {
    e.preventDefault();
    mousePoint = {x : e.pageX, y : e.pageY};
    if (mouseDown) {
        //The mouse was already down, meaning the user is mid-line
        //Create a new point on the current line
        lineDraw(convertLocalToWorldSpace(mousePoint));
    }
};
canvas.onmouseup = function(e){
    e.preventDefault();
    //Get the local mouse position
    var mouseLoc = {x : e.pageX, y : e.pageY};
    if(mouseDown){
        //Stop drawing the current line if the mouse was down
        stopLineDraw(convertLocalToWorldSpace(mouseLoc), true);
        mouseDown = false;
    }
};
canvas.onmouseout = function(e){
    e.preventDefault();
    var mouseLoc = {x : e.pageX, y : e.pageY};
    if(mouseDown){
        //Stop drawing the current line if the mouse was down
        stopLineDraw(convertLocalToWorldSpace(mouseLoc), true);
        mouseDown = false;
    }
};
canvas.addEventListener("wheel", function(e){
    e.preventDefault();
    //Enter the mess that is scaling
    handleScale(e);
});
var touchPoints = 0;
var gesturing = false;
var touchLineOpen = false;
canvas.addEventListener('touchstart', function(e){
    e.preventDefault();
    if(toolBoxOpen){
        toggleToolBoxOpen();
        return;
    }
    if(e.touches.length === 1){
        //One finger is currently on the screen
        touchPoints = 1;
        if(!gesturing){
            //Not currently gesturing so perform the action
            var touchLoc = {
                x : e.touches[0].pageX,
                y : e.touches[0].pageY
            };
            if(toolEditMenuOpen) {
                //User wants the edit tool menu to go away, not start drawing
                toggleEditMenu(touchLoc);
            } else {
                //The user is ready to start drawing, needs to send these points as world space
                if(touchLineOpen){
                    //The user tapped too quickly
                    //Just stop the current line at whatever position it was last at
                    stopLineDraw(touchLoc, false);
                }
                touchLineOpen = true;
                startLineDraw(touchLoc);
            }
        }
    } else if(e.touches.length === 2){
        if(touchPoints === 0){
            gesturing = true;
        }
        touchPoints = 2;
        var gesturePoint1 = convertLocalToCanvasSpace({
            x : e.touches[0].pageX,
            y : e.touches[0].pageY
        });
        var gesturePoint2 = convertLocalToCanvasSpace({
            x : e.touches[1].pageX,
            y : e.touches[1].pageY
        });
        gestureStart(gesturePoint1, gesturePoint2, !gesturing);
        gesturing = true;
    }
});
var touchPosition = {
    x : -1,
    y : -1
};
canvas.addEventListener('touchmove', function(e){
    e.preventDefault();
    if(e.touches.length === 1) {
        var touchLoc = {x: e.touches[0].pageX, y: e.touches[0].pageY};
        touchPosition = touchLoc;
        if (!gesturing) {
            //Only one finger on the screen, do the thing
            lineDraw(convertLocalToWorldSpace(touchLoc));
        }
    } else {
        //More than one finger on the screen
        var gesturePoint1 = convertLocalToCanvasSpace({
            x : e.touches[0].pageX,
            y : e.touches[0].pageY
        });
        var gesturePoint2 = convertLocalToCanvasSpace({
            x : e.touches[1].pageX,
            y : e.touches[1].pageY
        });
        gestureDrag(gesturePoint1, gesturePoint2);
    }
});
canvas.addEventListener("touchend", function(e){
    touchPoints = e.touches.length;
    if(touchPoints === 0){
        gesturing = false;
        touchLineOpen = false;
        stopLineDraw(convertLocalToWorldSpace(touchPosition), true);
    }
});
var gesture = {};
function gestureStart(point1, point2, first){
    if(first){
        cancelDraw();
    }
    gesture.viewport = clone(viewport);
    gesture.point1 = point1;
    gesture.point2 = point2;
    gesture.average = {
        x : (point1.x + point2.x) / 2,
        y : (point1.y + point2.y) / 2
    };
    gesture.averageWorld = convertCanvasToWorldSpace(gesture.average);
    gesture.distance = Math.sqrt((point2.x - point1.x) * (point2.x - point1.x) + (point2.y - point1.y) * (point2.y - point1.y));
}
function gestureDrag(point1, point2){
    //Get the average position of the drag
    var avgX = (point1.x + point2.x) / 2;
    var avgY = (point1.y + point2.y) / 2;
    //Get the distance of the drag - and they said I'd never use the distance formula in real life...
    var distance = Math.sqrt((point2.x - point1.x) * (point2.x - point1.x) + (point2.y - point1.y) * (point2.y - point1.y));
    viewport.scale = gesture.viewport.scale * (distance / gesture.distance);
    //Reset the offsets from the gesture to the actual viewport
    viewport.x = gesture.viewport.x;
    viewport.y = gesture.viewport.y;
    var currentPos = convertWorldToCanvasSpace(gesture.averageWorld);
    var newPos = {x : avgX, y : avgY};
    //Convert the gesture delta to the viewport
    viewport.x -= newPos.x - currentPos.x;
    viewport.y += newPos.y - currentPos.y;
    redrawCanvas();
}
window.onkeydown = function(e){
    //Control all the key events
    var key = e.which;
    if(key >= 37 && key <= 40){
        //One of the arrow keys down
        handleCanvasPan(key);
    }
    if(key === 67){
        //C key down
        handleRecenter();
    }
    //If user is pressing the e key and they aren't drawing
    if(key === 69 && !mouseDown && !textToolOpen){
        //Macs are stupid and cant use the right click so here is a keyboard shortcut
        if(toolEditMenuOpen){
            //User is right clicking again, must want to move the position of the edit tool menu
            redrawEditMenu(mousePoint);
        } else {
            //User is right clicking without the menu open, must want to open it
            toggleEditMenu(mousePoint);
        }
    }
};

var panSensitivity = 15;

//Pan the canvas around with the arrow keys
function handleCanvasPan(key){
    //directionVector: -1 if the direction should decrease, 1 if it should increase, 0 if it is unaffected
    var directionVector;
    switch(key){
        case 37:
            //Left arrow
            directionVector = { x : -1, y : 0 };
            break;
        case 38:
            //Up arrow
            directionVector = { x : 0, y : 1 };
            break;
        case 39:
            //Right arrow
            directionVector = { x : 1, y : 0 };
            break;
        case 40:
            //Down arrow
            directionVector = { x : 0, y : -1 };
            break;
    }
    //Implement the directional vector to the viewport
    viewport.x += directionVector.x * panSensitivity;
    viewport.y += directionVector.y * panSensitivity;
    //Update the canvas to reflect the pan
    context.save();
    context.translate(-viewport.x, viewport.y);
    context.restore();
    redrawCanvas();
}

//Recenter the viewport to the starting position
function handleRecenter(){
    //Update the user viewport
    viewport.x = 0;
    viewport.y = 0;
    viewport.scale = 1;
    //Update the canvas to reflect the movement
    context.save();
    context.translate(viewport.x, viewport.y);
    context.scale(viewport.scale, viewport.scale);
    context.restore();
    redrawCanvas();
}

function startLineDraw(loc){
    //The path that needs to be started
    var thisLine;
    var relSize = tool.size / viewport.scale;
    if(tool.type === "pen"){
        //Start a new pen drawing path
        loc = convertLocalToWorldSpace(loc);
        thisLine = { timestamp : new Date().getTime(), color : tool.color, size: relSize, points: [], type: 'pen'};
        emitNewLine(thisLine, loc);
    } else if(tool.type === "eraser") {
        //Start a new eraser drawing path
        loc = convertLocalToWorldSpace(loc);
        thisLine = { timestamp : new Date().getTime(), color : '#ffffff', size: relSize, points: [], type: 'eraser'};
        emitNewLine(thisLine, loc);
    } else if(tool.type === "text"){
        toggleTextTool(loc);
    } else if(tool.type === "image"){
        toggleImageTool(loc);
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

function stopLineDraw(loc, drawFinal){
    if(drawFinal){
        var cmd = {
            type : "update-draw",
            point : loc
        };
        //Send the final point to the server to be drawn
        drawConn.send(JSON.stringify(cmd));
    }
    var myPaths = clients[me].paths;
    var lineData;
    for(var i = 0; i < myPaths.length; i++){
        if(!myPaths[i].isDrawn){
            lineData = myPaths[i];
            //Can't have it reload as open
            lineData.isDrawn = true;
            cmd = {
                type : "close-path",
                lineData : lineData
            };
            //Tell everyone that the line is done
            drawConn.send(JSON.stringify(cmd));
        }
    }
}

function cancelDraw(){
    //Probably tryna gesture or something and got a bad line start, not a huge deal
    var cmd = {
        type : "cancel-path"
    };
    drawConn.send(JSON.stringify(cmd));
}

var textToolOpen = false;

//Toggle the text tool
//isRedraw - does the user want it closed or just to move it?
function toggleTextTool(point, isRedraw){
    var textTool = $('#text-tool');
    var textEntry = $('#text-input');
    if(!textToolOpen){
        //Open the text tool
        textTool.css("display", "block");
        textEntry.css("display", "block");
        redrawTextTool(point);
        textEntry.focus();
        textToolOpen = true;
    } else {
        //Text tool is open, determine what to do with it
        if(isRedraw){
            //User wants to move the text entry to a new place
            redrawTextTool(point);
            textToolOpen = true;
        } else {
            //User wants the text entry box gone
            textTool.css("display", "none");
            textEntry.css("display", "none");
            textToolOpen = false;
        }
    }
}

var imageToolOpen = false;

function toggleImageTool(point){
    var imageTool = $('#image-tool');
    var imageEntry = $('#image-input');
    if(!imageToolOpen){
        //Open the image tool
        imageTool.css("display", "block");
        imageEntry.css("display", "block");
        redrawImageTool(point);
        imageToolOpen = true;
    } else {
        //Close the image tool
        imageTool.css("display", "none");
        imageEntry.css("display", "none");
        imageEntry.val('');
        imageToolOpen = false;
    }
}

function redrawImageTool(point){
    //Reposition the image tool to be where the user clicked
    var imageTool = $('#image-tool');
    imageTool.css("top", point.y);
    imageTool.css("left", point.x + 1);
}

function redrawTextTool(point){
    var textTool = $('#text-tool');
    textTool.css("top", point.y);
    textTool.css("left", point.x + 1);
}

$('#enter-text-tool').click(function(){
    var textTool = $('#text-tool');
    var textInput = $('#text-input').val();
    if(textInput === ""){
        //Nothing is in the text box, do nothing
        return;
    }
    var relSize = tool.size * 5 / viewport.scale;
    var point = convertLocalToWorldSpace({
        x : textTool.position().left,
        y : textTool.position().top
    });
    var props = {timestamp : new Date().getTime(), color : tool.color, size : relSize, font : tool.font, type: 'text', point : point, val : textInput};
    var cmd = {
        type : "new-text",
        props : props
    };
    drawConn.send(JSON.stringify(cmd));
    toggleTextTool({x:0,y:0}, false);
});

$('#upload-image-button').click(function(){
    var imageTool = $('#image-tool');
    var imageEntry = $('#image-input').prop("files")[0];
    var imageReader = new FileReader();
    imageReader.addEventListener("load", function(){
        var image = imageReader.result;
        var relSize = tool.size / viewport.scale;
        var point = convertLocalToWorldSpace({
            x: imageTool.position().left,
            y: imageTool.position().top
        });
        var props = {timestamp : new Date().getTime(), color: tool.color, size: relSize, type: "image", point: point, data: image};
        var cmd = {
            type : "new-image",
            props : props
        };
        drawConn.send(JSON.stringify(cmd));
        toggleImageTool({x:0, y:0});
    }, false);
    if(imageEntry){
        imageReader.readAsDataURL(imageEntry);
    } else {
        alert("Could not upload this image");
    }
});

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
        me = drawCmd.me;
    } else if(drawCmd.type === "new-text"){
        sendingClient = clients[drawCmd.id];
        drawText(drawCmd.props);
        var textToolRecord = {
            path: drawCmd.props,
            isDrawn: true
        };
        sendingClient.paths.push(textToolRecord);
    } else if(drawCmd.type === "new-image"){
        sendingClient = clients[drawCmd.id];
        drawImage(drawCmd.props);
        var imageToolRecord = {
            path : drawCmd.props,
            isDrawn : true
        };
        sendingClient.paths.push(imageToolRecord);
    } else if(drawCmd.type === "cancel-path"){
        sendingClient = clients[drawCmd.id];
        sendingClient.paths.pop();
        redrawCanvas();
    } else if(drawCmd.type === "artifact-handshake"){
        artifacts = drawCmd.artifacts;
        redrawCanvas();
    }
}

var zoomSensitivity = 0.025;

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

var entities = [];

function redrawCanvas(){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    entities = [];
    currentEntityCounter = 0;
    context.save();
    context.translate(-viewport.x, viewport.y);
    context.scale(viewport.scale, viewport.scale);
    for(var i = 0; i < clients.length; i++){
        //Clients loop
        var client = clients[i];
        if(!client){
            continue;
        }
        if(client.paths.length !== 0){
            //Client does not have any paths
            for(var j = 0; j < client.paths.length; j++){
                //Paths loop
                entities.push(client.paths[j]);
            }
        }
    }
    entities.sort(function(a,b){return a.timestamp - b.timestamp});
    if(entities.length > 0){
        //Start the recursive redraw
        doRedraw(entities[currentEntityCounter]);
    }
}

var currentEntityCounter = 0;

function doRedraw(path){
    if (path.path.type === "text"){
        context.font = path.path.size.toString() + 'px ' + path.path.font.toString();
        context.fillStyle = path.path.color;
        var point = path.path.point;
        context.fillText(path.path.val, point.x, point.y);
        context.stroke();
        currentEntityCounter++;
        if(entities[currentEntityCounter]){
            doRedraw(entities[currentEntityCounter]);
        } else {
            context.restore();
        }
    } else if (path.path.type === "image"){
        var thisImage = new Image();
        thisImage.onload = function(){
            var point = path.path.point;
            context.drawImage(thisImage, point.x, point.y, thisImage.width, thisImage.height);
            currentEntityCounter++;
            if(entities[currentEntityCounter]){
                doRedraw(entities[currentEntityCounter]);
            } else {
                context.restore();
            }
        };
        thisImage.src = path.path.data;
    } else {
        //This is a pen or eraser, draw it like a line, nothing special
        //Redraw every point in this path
        context.beginPath();
        context.strokeStyle = path.path.color;
        context.lineWidth = path.path.size;
        context.lineCap = 'round';
        path.path.points.forEach(function(point, i){
            if(i === 0){
                //This is the first point in this line
                context.moveTo(point.x, point.y);
            } else {
                var lastPoint = path.path.points[i - 1];
                context.moveTo(lastPoint.x, lastPoint.y);
            }
            context.lineTo(point.x, point.y);
        });
        context.stroke();
        currentEntityCounter++;
        if(entities[currentEntityCounter]){
            doRedraw(entities[currentEntityCounter]);
        } else {
            context.restore();
        }
    }
}

function drawPoint(path, point){
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
        context.moveTo(point.x, point.y);
    } else {
        //This is not the first point so move to the last drawn points location
        var lastPoint = path.points[path.points.length - 1];
        context.moveTo(lastPoint.x, lastPoint.y);
    }
    //Draw the line to the current point
    context.lineTo(point.x, point.y);
    //Update the canvas element
    context.stroke();
    context.restore();
}

function drawText(props){
    //TODO: consolidate the context setup into a function of its own
    context.save();
    context.translate(-viewport.x, viewport.y);
    context.scale(viewport.scale, viewport.scale);
    context.font = props.size.toString() + 'px ' + props.font.toString();
    context.fillStyle = props.color;
    context.fillText(props.val, props.point.x, props.point.y);
    context.stroke();
    context.restore();
}

function drawImage(props){
    context.save();
    context.translate(-viewport.x, viewport.y);
    context.scale(viewport.scale, viewport.scale);
    var thisImage = new Image();
    thisImage.onload = function(){
        context.drawImage(thisImage, props.point.x, props.point.y, thisImage.width * viewport.scale, thisImage.height * viewport.scale);
        context.restore();
    };
    thisImage.src = props.data;
}

function convertLocalToWorldSpace(localLoc){
    return convertCanvasToWorldSpace(convertLocalToCanvasSpace(localLoc));
}

function convertCanvasToWorldSpace(canvasLoc){
    var loc = clone(canvasLoc);
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
    var point = clone(worldLoc);
    point.x *= viewport.scale;
    point.y *= viewport.scale;
    point.x -= viewport.x;
    point.y += viewport.y;
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
    redrawCanvas();
};

function calibrateCanvas(){
    var localCanvas = $('#canvas')[0];
    localCanvas.width = window.innerWidth;
    localCanvas.height = window.innerHeight;
}

window.onload = function(){
    calibrateCanvas();
    redrawCanvas();
};

var toolBoxOpen = false;

//Enable the toolbox from the mobile one
$('#mobile-tool-box').click(function(){
    toggleToolBoxOpen();
});

function toggleToolBoxOpen(){
    var toolbox = $('#toolbox');
    var miniToolBox = $('#mobile-tool-box');
    var miniContext = $('#mobile-context');
    if(toolBoxOpen){
        //Tool box should be closed
        miniToolBox.css("display", "block");
        miniContext.css("display", "block");
        toolbox.css("display", "none");
        toolBoxOpen = false;
    } else {
        miniToolBox.css("display", "none");
        miniContext.css("disaply", "none");
        toolbox.css("display", "block");
        toolBoxOpen = true;
    }
}

$('.tool-option').click(function(){
    $('.tool-option').each(function(){
        $(this).removeClass("selected-tool");
    });
    tool.type = $(this).data("toolname");
    $(this).addClass("selected-tool");
    if(toolEditMenuOpen){
        toggleEditMenu({x:0, y:0});
    } else if(textToolOpen){
        toggleTextTool({x: 0, y:0});
    } else if(imageToolOpen) {
        toggleImageTool({x : 0, y : 0});
    }
    //Close the entire toolbox
    if(window.innerWidth <= 768){
        toggleToolBoxOpen();
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
        case "text":
            contextMenu = $('#edit-text-tool');
            break;
        case "image":
            contextMenu = $('#edit-image-tool');
        default: return;
    }
    if(!toolEditMenuOpen){
        //Tool edit menu is not open, but it needs to be
        toolEditMenu.css("display", "block");
        contextMenu.css("display", "block");
        contextMenu.find(".tool-edit-option").css("display", "block");
        if(window.innerWidth >= 768){
            redrawEditMenu(loc);
        }
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
        } else if(attr === "font"){
            $('#font-options').css("display", "block");
        }
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
$('.font-option').click(function(){
    tool.font = $(this).data("font");
    $('#font-options').css("display", "none");
    toggleEditMenu({x:0,y:0});
});