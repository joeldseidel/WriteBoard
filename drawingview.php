<!DOCTYPE html>
<head>
    <!--mobile formatting-->
    <meta name="viewport" content="width=device-width, initial-scale=1" charset="UTF-8"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <!--did you really think we would use vanilla javascript?-->
    <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
    <!-- bring in bootstrap to assist with some styling-->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style/style.css"/>
    <title>Boeing Hack-a-thon</title>
</head>
<body>
<div id="chat">
    <div id="chat-header">
        <div class="row p-0 m-0">
            <button id="close-chat-button" class="transparent-button" type="button"><i class="material-icons">close</i></button>
        </div>
    </div>
    <div id="chat-view"></div>
    <div id="chat-controls" class="w-100">
        <div class="row m-0 p-0">
            <div class="col-8 m-0 p-0">
                <input class="w-100" type="text" id="chat-input">
            </div>
            <div class="col-4 m-0 p-0">
                <button class="w-100" type="button" id="send-chat-button">Send</button>
            </div>
        </div>
    </div>
</div>
<div id="mini-chat">
    <div class="row m-0 p-0" id="mini-chat-controls">
        <button id="open-chat" class="transparent-button" type="button"><i class="material-icons">open_in_browser</i></button>
        <p id="notifications"></p>
    </div>
</div>
<div id="toolbox">
    <div id="tool-select">
        <ul class="toolbox-listing">
            <li>
                <div class="tool-option" data-toolname="pen">
                    <i class="material-icons">border_color</i>
                    <p class="tool-name">Pen</p>
                </div>
            </li>
            <li>
                <div class="tool-option" data-toolname="eraser">
                    <i class="material-icons">border_clear</i>
                    <p class="tool-name">Eraser</p>
                </div>
            </li>
            <li>
                <div class="tool-option" data-toolname="text">
                    <i class="material-icons">text_fields</i>
                    <p class="tool-name">Text</p>
                </div>
            </li>
            <li>
                <div class="tool-option" data-toolname="image">
                    <i class="material-icons w-100">image</i>
                    <p class="tool-name">Image</p>
                </div>
            </li>
        </ul>
    </div>
</div>
<div id="tool-edit-menu" oncontextmenu="return false">
    <div class="tool-edit-listing">
        <div class="m-0 p-0">
            <div class="tool-edit-option w-100" data-editattr="color">
                <i class="material-icons">format_color_fill</i>
            </div>
        </div>
        <div>
            <div class="tool-edit-option" data-editattr="size">
                <i class="material-icons">bubble_chart</i>
            </div>
        </div>
        <div>
            <div class="tool-edit-option" data-editattr="close">
                <i class="material-icons">close</i>
            </div>
        </div>
    </div>
</div>
<!-- the drawing area and magical land: the canvas -->
<canvas id="canvas" oncontextmenu="return false"></canvas>
<!--connection to the client, at the end so canvas is ready-->
<script src="js/chat-client.js"></script>
<script src="js/draw-client.js"></script>
</body>