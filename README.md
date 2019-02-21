README

# WriteBoard
### Real-time Online Collaboration Tool

### [Launch WriteBoard](http://hackathon.mavericksystems.us)

WriteBoard is a PHP application making use of the WebSockets protocol for real-time collaboration between a virtually unlimited number of clients.


This application makes use of the Ratchet PHP WebSockets library for the component interface on the server side, the jQuery library for some JavaScript interactions, and Bootstrap for HTML styling.

 
## Controls:
#### PC / Mac

**Click and drag** on the canvas to draw

**Click** to use image and text tools

**Right click** or E to open tool properties context menu.

**Scroll** to scale canvas.

**Arrow keys** to pan around the canvas (scrolling can also accomplish this as the canvas will zoom at the pointer location).

**C** to recenter the canvas at the original location.


####Mobile

**Touch and drag** on the canvas to draw

**Touch** to use image and text tools

_NOTE: there currently is no way to open the tool properties menu on mobile. Sorry.

**Two finger pinch / extend** (standard mobile zoom control) to scale and pan canvas.


##Tools:
####Pen:

Use to make a line / path / circle / picture - whatever you want it to do. You can change your color and the tool size in the tool properties menu (_right click or E_).

####Eraser

Erase things. Really just a dedicated, canvas-colored pen tool.

####Text

Write text at whatever location you click. You can change what you say in the text tool itself and the color, size, and font in which you say it in the tool properties menu (_right click or E_).

####Image

Place an image at whatever location you click. _NOTE: if you place too many images, you will exceed the canvas buffer size and the canvas will drop entities at random. Don't lose entities at random_