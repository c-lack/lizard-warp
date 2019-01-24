var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const PORT = 3000;

app.use(express.static(__dirname +'./../../')); //serves the index.html
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + './../../index.html');
});

//listens on port 3000 -> http://localhost:3000/
server.listen(PORT,() => console.log('listening on port', PORT));

// New connection
io.on('connection', (client) => {
  console.log('user connected');

  client.on('disconnect', () => {
    console.log('user disconnected');
  })
});
