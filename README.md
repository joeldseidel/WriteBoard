README

# WriteBoard #
### Real-time Online Collaboration Tool ###

### [Launch WriteBoard](http://hackathon.mavericksystems.us) ###

WriteBoard is a PHP application making use of the WebSockets protocol for real-time collaboration between a virtually unlimited number of clients.


This application makes use of the Ratchet PHP WebSockets library for the component interface on the server side, the jQuery library for some JavaScript interactions, and Bootstrap for HTML styling.

 
## Controls: ##
#### PC / Mac ####

**Click and drag** on the canvas to draw

**Click** to use image and text tools

**Right click** or E to open tool properties context menu.

**Scroll** to scale canvas.

**Arrow keys** to pan around the canvas (scrolling can also accomplish this as the canvas will zoom at the pointer location).

**C** to recenter the canvas at the original location.

#### Mobile ####

**Touch and drag** on the canvas to draw

**Touch** to use image and text tools

_NOTE: there currently is no way to open the tool properties menu on mobile. Sorry._

**Two finger pinch / extend** (standard mobile zoom control) to scale and pan canvas.


## Tools: ##
#### Pen: ####

Use to make a line / path / circle / picture - whatever you want it to do. You can change your color and the tool size in the tool properties menu (_right click or E_).

#### Eraser ####

Erase things. Really just a dedicated, canvas-colored pen tool.

#### Text ####

Write text at whatever location you click. You can change what you say in the text tool itself and the color, size, and font in which you say it in the tool properties menu (_right click or E_).

#### Image ####

Place an image at whatever location you click. _NOTE: if you place too many images, you will exceed the canvas buffer size and the canvas will drop entities at random. Don't lose entities at random_

## About ##

WriteBoard is made up of 3 main components:
1. Client web page: this is what the user sees. The JavaScript within this page does all of the command sending, receiving, and handling.
2. PHP WebSockets server : this maintains state with the connected clients and takes sent commands and sends them to all the other clients. Except for the handshake process, there is no processing completed on the PHP server.
3. Java HTTP server: this API allows for data interaction in the background to greatly improve the PHP WebSocket server performance. The HTTP server takes entity commit (store to database) requests and queues them with a near instant 200 OK return to the PHP Server. Background workers than perform this async database interactions.

WriteBoard is a unique application in that it makes use of the WebSockets protocol to give commands to all the clients connected to the server. When an event occurs on the DOM, this triggers the client side JavaScript WebSockets connection to send a specific command time. For instance, if the user clicks on the canvas with the pen tool selected, the client will send a "start-path" command with path properties (color, size, etc.) and an "update-draw" command with the location of the first point. The PHP WebSockets server receives this and attaches the connection id of the sender to the message and sends it to all the collected clients.
 
When a command is received by a client, the client determines what type of command it is and handles it accordingly. For instance, continuing the previous example of a line start and update draw command, the receiving client takes the sending client id and finds it with its local client array. With the the path start command, the receiving client pushes the new path properties object into the sending user's paths array. When the update draw command arrives, the receiving client finds the receiving client in the array and finds which of the sending client's paths are not completely drawn yet. Since a single client can only have one path open at a time (this stands to logic unless you have two mice), the point is then added to the open path points array and drawn to the screen from the last point in this array. Other commands handle the other functions, such as images, text, line endings, etc.

The other noteworthy commands is the socket handshake process. The socket handshake allows for the joining client to know the other clients that are currently drawing and to receive the last 100 entities on the canvas. The socket handshake is a three step process:
1. WebSocket protocol handshake
   - Defined by the WebSocket protocol
   - Initializes client connection state with the WebSocket server
   - Invokes the connection interface application layer handshake process
2. Simultaneous connection handshake
   - Defined in the WriteBoard PHP server (written by us)
   - Initializes application layer state between the PHP server and the JavaScript client script
   - Invokes client creation for the previously connected clients on the joining client's client-side array
   - Tells the joining client who they are in relation to the server (their WebSocket resource id)
3. Artifact handshake
   - Three-way handshake between the joining client, the PHP WebSockets server, and the backend HTTP server.
   - Artifacts (ambiguous entities that happened before the user joined) are requested by the client, routed to the backend server through the PHP server, and fulfilled by the HTTP server accessing the backend MySQL database
   - Artifacts are returned from the HTTP server to the PHP server and routed to the joining client to complete the handshake.
   - Upon completion, the artifacts are drawn to the user's canvas
   - The artifact handshake is non-blocking, so the PHP server can continue to function in a stateless manner if the HTTP server is down
   
   
We hope you enjoy WriteBoard!

Feel free to contact [me](joelseidel.com) with any questions regarding the application.
