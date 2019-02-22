package main.Managers.Database;

import java.io.IOException;
import java.io.InputStream;
import java.sql.*;
import java.util.Properties;

public class DatabaseInteraction {
    private Connection dbConn;

    public DatabaseInteraction(){
        Properties properties = new Properties();
        InputStream input;
        try{
            //Read the properties file to get the database connection data
            input = getClass().getResourceAsStream("database.properties");
            properties.load(input);
            String host = properties.getProperty("host");
            int port = Integer.parseInt(properties.getProperty("port"));
            String username = properties.getProperty("username");
            String password = properties.getProperty("password");
            String database = properties.getProperty("dbname");
            this.dbConn = this.createConnection(host, port, username, password, database);
        } catch (IOException ioEx) {
            ioEx.printStackTrace();
        }
    }

    /**
     * Create a new database connection with its respective property values
     * @param host host name of the databsae
     * @param port port of the database
     * @param username username
     * @param password also the username ... ?  just kidding its the password
     * @param database database name to connect to
     * @return opened connection object
     */
    private Connection createConnection(String host, int port, String username, String password, String database){
        try {
            Class.forName("com.mysql.jdbc.Driver");
            String url = "jdbc:mysql://" + host + ":" + port + "/" + database;
            return DriverManager.getConnection(url, username, password);
        } catch (ClassNotFoundException cnfEx) {
            cnfEx.printStackTrace();
        } catch (SQLException sqlEx) {
            System.out.println("Data connection failed with exception: " + sqlEx.getMessage());
        }
        return null;
    }

    /**
     * Close the currently open database connection
     */
    public void closeConnection(){
        try{
            dbConn.close();
        } catch (SQLException sqlEx) {
            sqlEx.printStackTrace();
        }
    }

    /**
     * Prepare a statement. Abstraction for the connection
     * @param sql sql string to prepare
     * @return prepared statement object
     */
    public PreparedStatement prepareStatement(String sql){
        PreparedStatement preparedStatement;
        try {
            preparedStatement = dbConn.prepareStatement(sql);
        } catch (SQLException sqlEx) {
            sqlEx.printStackTrace();
            preparedStatement = null;
        }
        return preparedStatement;
    }

    /**
     * Query the database. Do something. Get something back
     * @param queryStatement prepared statement to run
     * @return result set with the query results
     */
    public ResultSet query(PreparedStatement queryStatement){
        try{
            return queryStatement.executeQuery();
        } catch (SQLException sqlException) {
            return null;
        }
        catch (NullPointerException nex) {
            System.out.println(nex.getMessage());
            return null;
        }
    }

    /**
     * Nonquery the database. Do something. Get nothing back
     * @param nonQueryStatement prepared statement to run
     */
    public void nonQuery(PreparedStatement nonQueryStatement){
        try{
            nonQueryStatement.executeUpdate();
        } catch (SQLException sqlEx) {
            sqlEx.printStackTrace();
        }
    }
}
