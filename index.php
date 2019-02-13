<!DOCTYPE html>
<head>
    <title>WriteBoard</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Welcome to WriteBoard</h1>
    <form id="enterForm">
        <label for="username">Enter a username:</label>
        <input type="text" id="username">
        <button type="button" id="submitUsername">Enter the chat</button>
    </form>
    <script>
        $('#submitUsername').click(function(){
            var username = $('#username').val();
            window.location.href = "drawinterface.php?username=" + username;
        });
    </script>
</body>