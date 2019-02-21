<!DOCTYPE html>
<head>
    <title>WriteBoard</title>
    <meta charset="UTF-8">
    <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
    <link rel="stylesheet" type="text/css" href="style/style.css"/>
</head>
<body>
    <h1 class="w-100" id="main-title">Welcome to WriteBoard</h1>
    <div class="row m-0 p-0">
        <div class="col-lg-3">
        </div>
        <div class="col-lg-6">
            <form id="enterForm">
                <label for="username">Enter a username:</label>
                <input type="text" id="username">
                <button type="button" id="submitUsername">Enter the workspace</button>
            </form>
        </div>
        <div class="col-lg-3">
        </div>
    </div>
    <script>
        $(document).ready(function(){
            $('#submitUsername').click(function(){
                var username = $('#username').val();
                window.location.href = "drawingview.php?username=" + username;
            });
        });
    </script>
</body>