package main.Handlers;

import com.sun.net.httpserver.HttpHandler;
import main.Managers.PathListener;
import org.json.JSONObject;

public class AddPathHandler extends HandlerPrototype implements HttpHandler {
    public AddPathHandler(){
        requiredKeys = new String[]{"data", "id"};
        handlerName = "Add Path Handler";
    }
    @Override
    protected void fulfillRequest(JSONObject requestParams) {
        //Enqueue the line object and return successfully
        try{
            PathListener.commitQueue.put(requestParams.toString());
        } catch (InterruptedException iEx) {
            iEx.printStackTrace();
        }
    }
}
