<?php
namespace TeamFour;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chat implements MessageComponentInterface{
    protected $clients;
    private $connectedUsers;
    private $logs;
    private $connectedUsernames;

    public function __construct(){
        $this->clients = new \SplObjectStorage;
        $this->logs = [];
        $this->connectedUsers = [];
        $this->connectedUsernames = [];
    }
    public function onOpen(ConnectionInterface $conn){
        $this->clients->attach($conn);
        $conn->send(json_encode($this->logs));
        $this->connectedUsers[$conn->resourceId] = $conn;
    }
    public function onMessage(ConnectionInterface $from, $msg){
        //Determine if this is a real message or if it is a username registration
        if(isset($this->connectedUsernames[$from->resourceId])){
            //It is a real message
            //Add the message to the message log
            $this->logs[] = array(
                "user" => $this->connectedUsernames[$from->resourceId],
                "type" => "msg",
                "msg" => $msg,
                "timestamp" => time()
            );
            //Send message to all of the users
            $this->sendMessage(end($this->logs));
        } else {
            //This is the first message auto sent after connection which defines the user's name
            $this->connectedUsernames[$from->resourceId] = $msg;
            $this->logs[] = array(
                "user" => $this->connectedUsernames[$from->resourceId],
                "type" => "event",
                "msg" => "joined the chat",
                "timestamp" => time()
            );
            //Alert other users that they joined
            $this->sendMessage(end($this->logs));
        }
    }
    private function sendMessage($message){
        foreach($this->connectedUsers as $user){
            $user->send(json_encode($message));
        }
    }
    public function onClose(ConnectionInterface $conn){
        $this->clients->detach($conn);
        echo "{$conn->resourceId} disconnected\n";
    }
    public function onError(ConnectionInterface $conn, \Exception $e){
        echo "Error occurred :[   ERROR MESSAGE: {$e->getMessage()}\n";
    }
}