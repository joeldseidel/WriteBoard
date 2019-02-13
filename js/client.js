//TODO: implement the magic in here

init();

function init(){
    var username = getUsernameArg();
}

function getUsernameArg(){
    var usernameParam = window.location.search.replace("?", '');
    return usernameParam.replace("username=", '');
}