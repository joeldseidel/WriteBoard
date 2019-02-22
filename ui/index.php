<!DOCTYPE html>
<head>
    <title>WriteBoard</title>
    <meta charset="UTF-8">
    <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
    <link rel="stylesheet" type="text/css" href="style/style.css"/>
    <!-- bring in bootstrap to assist with some styling-->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
</head>
<body>
    <h1 class="w-100" id="main-title">Welcome to WriteBoard</h1>
    <div class="row">
        <div class="col-md-3"></div>
        <div class="col-md-6">
            <form class="w-100" id="enterForm">
                <div class="row">
                    <div class="col-4">
                        <label  for="username">Enter a username:</label>
                    </div>
                    <div class="col-8">
                        <input class="w-100" type="text" id="username"><br>
                    </div>
                </div>
                <button class="btn btn-outline-primary w-100" type="button" id="submitUsername">Enter the workspace</button>
            </form>
        </div>
        <div class="col-md-3"></div>
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