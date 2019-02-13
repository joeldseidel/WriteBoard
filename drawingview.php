<!DOCTYPE html>
<head>
    <!--mobile formatting-->
    <meta name="viewport" content="width=device-width, initial-scale=1" charset="UTF-8"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <!--did you really think we would use vanilla javascript?-->
    <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
    <link rel="stylesheet" type="text/css" href="style/style.css"/>
    <title>Boeing Hack-a-thon</title>
</head>
<body>
<div id="chat">
    <div id="chat-view"></div>
    <div id="chat-controls">
        <input type="text" id="chat-input">
        <button type="button" id="send-chat-button">Space Jam</button>
    </div>
</div>
<!-- the drawing area and magical land: the canvas -->
<canvas id="canvas"></canvas>
<!--connection to the client, at the end so canvas is ready-->
<script src="./js/client.js"></script>
</body>