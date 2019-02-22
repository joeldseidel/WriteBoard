import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;


class MyHandler implements HttpHandler {
       public void handle(HttpExchange t) throws IOException {
           InputStream is = t.getRequestBody();
           read(is); // .. read the request body
           String response = "This is the response";
           t.sendResponseHeaders(200, response.length());
           OutputStream os = t.getResponseBody();
           os.write(response.getBytes());
           os.close();
       }
   }
   ...

   HttpServer server = HttpServer.create(new InetSocketAddress(8000));
   server.createContext("/applications/myapp", new MyHandler());
   server.setExecutor(null); // creates a default executor
   server.start();