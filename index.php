<!DOCTYPE html>
<head>
    <title>WriteBoard</title>
    <meta charset="UTF-8">
    <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
</head>
<body>
    <h1>Welcome to WriteBoard</h1>
    <form id="enterForm">
        <label for="username">Enter a username:</label>
        <input type="text" id="username">
        <button type="button" id="submitUsername">Enter the workspace</button>
    </form>
    <script>
        $(document).ready(function(){
            $('#submitUsername').click(function(){
                var username = $('#username').val();
                window.location.href = "drawingview.php?username=" + username;
            });
        });
    </script>
</body>