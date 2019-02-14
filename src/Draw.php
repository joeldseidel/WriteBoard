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
        $this->sendMessage($msg, $from);
    }
    private function sendMessage($message, $from){
        foreach($this->connectedUsers as $user){
            echo "Sent new points to " . $user->resourceId . " from " . $from->resourceId . "\n";
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