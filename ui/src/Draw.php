<?php
namespace TeamFour;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Draw implements MessageComponentInterface{
    protected $clients;
    private $connectedUsers;
    private $api_url = "18.191.68.244:6869";
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
        $welcomeMsg->me = $conn->resourceId;
        $this->sendMessage(json_encode($welcomeMsg));
    }
    public function onMessage(ConnectionInterface $from, $msg){
        //Open the command
        $msg = json_decode($msg);
        //add the sender id
        $msg->id = $from->resourceId;
        if($msg->type == "close-path"){
            $this->handleLineCommit($msg->lineData, $msg->id);
        }
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
    public function handleLineCommit($lineData, $id){
        //TODO make the http request
        echo "line commit from " . $id;
    }
}