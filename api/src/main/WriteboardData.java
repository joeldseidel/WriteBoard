package main;

import com.sun.net.httpserver.HttpServer;
import main.Handlers.AddPathHandler;
import main.Managers.PathListener;

import java.io.IOException;
import java.net.InetSocketAddress;

/**
 * Author: Joel Seidel / Xuezhou Wen
 */
public class WriteboardData {
    /**
     * Entry point for the API
     * Start the HTTP Server listener when the API is started
     *
     * @param args because java
     */
    public static void main(String args[]){
        PathListener.startListener();
        //Create http server
        try{
            HttpServer server;
            server = HttpServer.create(new InetSocketAddress(6869), 0);
            server.createContext("/add-path", new AddPathHandler());
            server.start();
        } catch (IOException ioEx) {
            //In my years of working with Java HTTP/s, never once have I encountered this
            //But it's here to shut IntelliJ up
            ioEx.printStackTrace();
        }
    }
}
