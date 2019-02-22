package main.Handlers;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public abstract class HandlerPrototype {
    protected String[] requiredKeys;
    protected String handlerName;
    protected String response;

    public void handle(HttpExchange httpExchange) throws IOException {
        //Get the passed JSON from the HTTP request
        JSONObject requestParams = getParameterObject(httpExchange);
        boolean isValidRequest = isRequestValid(requestParams);
        if(isValidRequest){
            fulfillRequest(requestParams);
        } else {
            this.response = "";
        }
        int responseCode = isValidRequest ? 200 : 400;
        Headers header = httpExchange.getResponseHeaders();
        header.add("Access-Control-Allow-Origin", "*");
        httpExchange.sendResponseHeaders(responseCode, this.response.length());
        System.out.println("Response to " + this.handlerName + ": " + this.response);
        OutputStream os = httpExchange.getResponseBody();
        os.write(this.response.getBytes());
        os.close();
    }

    private JSONObject getParameterObject(HttpExchange httpExchange) throws IOException{
        //Read the request content
        InputStream paramInStream = httpExchange.getRequestBody();
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        byte[] inBuffer = new byte[2048];
        int readBytes;
        //Read content byte array from request
        while ((readBytes = paramInStream.read(inBuffer)) != -1) {
            byteArrayOutputStream.write(inBuffer, 0, readBytes);
        }
        //Convert read content byte array to string
        String jsonString = byteArrayOutputStream.toString();
        //Return params as JSON object
        if(!jsonString.equals("")){
            return new JSONObject(jsonString);
        } else {
            return null;
        }
    }

    private boolean isRequestValid(JSONObject params){
        if(params == null){
            System.out.println("Error: request came with empty params");
            return false;
        }
        for(String requiredKey : requiredKeys){
            if(!params.has(requiredKey)){
                //Missing required key, cannot be a valid request
                System.out.println("Error: request missing required key " + requiredKey);
                return false;
            }
        }
        return true;
    }

    protected abstract void fulfillRequest(JSONObject requestParams);
}
