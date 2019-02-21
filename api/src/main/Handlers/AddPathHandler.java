package main.Handlers;

import com.sun.net.httpserver.HttpHandler;
import org.json.JSONObject;

public class AddPathHandler extends HandlerPrototype implements HttpHandler {
    public AddPathHandler(){
        requiredKeys = new String[]{"data", "id"};
        handlerName = "Add Path Handler";
    }
    @Override
    protected void fulfillRequest(JSONObject requestParams) {
        //TODO: enqueue this object string so that the other thread can put it in the database
    }
}
