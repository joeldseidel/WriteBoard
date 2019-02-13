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
        //may need to differentiate commands here but probably not
        //TODO: determine if we need to change the message at all before sending it out
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