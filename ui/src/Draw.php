<?php
namespace TeamFour;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Draw implements MessageComponentInterface{
    protected $clients;
    private $connectedUsers;
    public function __construct(){
        $this->clients = new \SplObjectStorage;
        $this->connectedUsers = [];
    }
    public function onOpen(ConnectionInterface $conn){
        $this->clients->attach($conn);
        $this->connectedUsers[$conn->resourceId] = $conn;
        echo "{$conn->resourceId} connected\n";
        //Send to the connected client who is already here
        $connectedIds = array();
        foreach($this->connectedUsers as $user){
            array_push($connectedIds, $user->resourceId);
        }
        $welcomeMsg = new \stdClass();
        $welcomeMsg->type = "welcome";
        $welcomeMsg->friendsHere = $connectedIds;
        $this->sendMessage(json_encode($welcomeMsg));
    }
    public function onMessage(ConnectionInterface $from, $msg){
        //Open the command
        $msg = json_decode($msg);
        if($msg->type == "new-path"){
            echo $from->resourceId . " started a new path\n";
        }
        //add the sender id
        $msg->id = $from->resourceId;
        //Close the command
        $msg = json_encode($msg);
        //Send the command to connected clients
        $this->sendMessage($msg);
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