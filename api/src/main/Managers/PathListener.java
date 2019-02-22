package main.Managers;

import java.util.LinkedList;
import java.util.Queue;

public class PathListener {
    public static Queue<String> commitQueue = new LinkedList<>();

    public static void startListener(){
        //Start the listener to the queue for entering lines into the database
        Thread pathQueueListener = new Thread(() -> {
            //Listener loop
            while(true){
                //Get the next committed line from the queue
                Object nextPathObj = commitQueue.poll();
                if(nextPathObj != null){
                    
                }
            }
        });
        pathQueueListener.start();
    }
}
