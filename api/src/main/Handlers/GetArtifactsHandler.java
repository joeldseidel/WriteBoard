package main.Handlers;

import com.sun.net.httpserver.HttpHandler;
import main.Managers.Database.DatabaseInteraction;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class GetArtifactsHandler extends HandlerPrototype implements HttpHandler {
    public GetArtifactsHandler(){
        requiredKeys = new String[]{};
    }
    @Override
    protected void fulfillRequest(JSONObject requestParams){
        DatabaseInteraction database = new DatabaseInteraction();
        String getArtifactsSql = "SELECT entity_data FROM entities LIMIT 100";
        PreparedStatement getArtifactsStmt = database.prepareStatement(getArtifactsSql);
        ResultSet artifactsResult = database.query(getArtifactsStmt);
        JSONArray artifactArray = new JSONArray();
        try{
            while(artifactsResult.next()){
                artifactArray.put(artifactsResult.getString("entity_data"));
            }
        } catch(SQLException sqlEx){
            sqlEx.printStackTrace();
        }
        this.response = artifactArray.toString();
    }
}
