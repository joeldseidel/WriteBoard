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
            <button id="close-chat-button" type="button"><i class="material-icons">close</i></button>
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
<!-- the drawing area and magical land: the canvas -->
<canvas id="canvas"></canvas>
<!--connection to the client, at the end so canvas is ready-->
<script src="./js/client.js"></script>
</body>