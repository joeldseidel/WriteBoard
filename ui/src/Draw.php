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
        //Create the client welcome hand shake
        $welcomeMsg = new \stdClass();
        $welcomeMsg->type = "welcome";
        $welcomeMsg->friendsHere = $connectedIds;
        $welcomeMsg->me = $conn->resourceId;
        $this->sendMessage(json_encode($welcomeMsg));
        $artifactHandshake = new \stdClass();
        $artifactHandshake->artifacts = $this->getArtifacts();
    }
    public function onMessage(ConnectionInterface $from, $msg){
        //Open the command
        $msg = json_decode($msg);
        //add the sender id
        $msg->id = $from->resourceId;
        if($msg->type == "close-path"){
            $this->commitToData($msg->lineData);
        } else if($msg->type == "new-text"){
            $this->commitToData($msg->props);
        } else if($msg->type == "new-image"){
            $this->commitToData($msg->props);
        }
        //Close the command
        $msg = json_encode($msg);
        //Send the command to connected clients
        $this->sendMessage($msg);
    }
    private function sendMessage($message){
        //This goes to all user's regardless of room
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
    private function commitToData($data){
        $data = json_encode($data);
        try{
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "http://localhost/add-path");
            curl_setopt($ch, CURLOPT_PORT, 6869);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 100);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
            curl_exec($ch);
            curl_close($ch);
        } catch(Exception $e){
            echo $e->getMessage();
        }
    }
    private function getArtifacts(){
        try{
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "http://localhost/get-artifacts");
            curl_setopt($ch, CURLOPT_PORT, 6869);
            curl_setopt($ch, CURLOPT_POST, 1);
            //Give is a dummy payload to fool the server into not dropping the packet
            $payload = new \stdClass();
            $payload->content = "joel is neat";
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 100);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
            curl_exec($ch);
            echo curl_error($ch);
            curl_close($ch);
        } catch(Exception $e){
            echo $e->getMessage();
        }
    }
}