<?php
namespace TeamFour;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chat implements MessageComponentInterface{
    protected $clients;
    public function __construct(){
        $this->clients = new \SplObjectStorage;
    }
    public function onOpen(ConnectionInterface $conn){
        $this->clients->attach($conn);
        echo "{$conn->resourceId} connected\n";
    }
    public function onMessage(ConnectionInterface $from, $msg){
        $numRecv = count($this->clients) - 1;
        echo sprintf('Connection %d sending message "%s" to %d other connections%s' . "\n", $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');
        foreach($this->clients as $client){
            if($from !== $client){
                $client->send($msg);
            }
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