<?php
namespace TeamFour;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Exception;

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
        $welcomeMsg->me = $conn->resourceId;
        $this->sendMessage(json_encode($welcomeMsg));
    }
    public function onMessage(ConnectionInterface $from, $msg){
        //Open the command
        $msg = json_decode($msg);
        //add the sender id
        $msg->id = $from->resourceId;
        if($msg->type == "close-path"){
            $this->handleLineCommit($msg);
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
    public function handleLineCommit($commitMsg){
        $lineData = new \stdClass();
        var_dump($commitMsg);
        $lineData->data = $commitMsg->lineData;
        $lineData->id = $commitMsg->id;
        $lineJson = json_encode($lineData);
        try{
            //TODO make the http request
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "http://localhost/add-path");
            curl_setopt($ch, CURLOPT_PORT, 6869);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $lineJson);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 100);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
            $response = curl_exec($ch);
            echo curl_error($ch);
            curl_close($ch);
            echo $response;
        } catch(Exception $e){
            echo $e->getMessage();
        }
    }
}