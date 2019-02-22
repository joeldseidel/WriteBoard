package main.Managers;

import main.Managers.Database.DatabaseInteraction;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class PathListener {
    public static BlockingQueue<String> commitQueue = new ArrayBlockingQueue(1024);

    public static void startListener(){
        //Start the listener to the queue for entering lines into the database
        Thread pathQueueListener = new Thread(() -> {
            DatabaseInteraction database = new DatabaseInteraction();
            //Listener loop
            while(true){
                try{
                    //Get the next committed line from the queue
                    Object nextPathObj = commitQueue.take();
                    if(nextPathObj != null){
                        String insertLineSql = "INSERT INTO entities(entity_data) VALUES (?)";
                        PreparedStatement insertLineStmt = database.prepareStatement(insertLineSql);
                        try{
                            insertLineStmt.setString(1, nextPathObj.toString());
                        } catch (SQLException sqlEx) {
                            sqlEx.printStackTrace();
                        }
                        database.nonQuery(insertLineStmt);
                    }
                } catch (InterruptedException iEx) {
                    iEx.printStackTrace();
                }
            }
        });
        pathQueueListener.start();
    }
}
