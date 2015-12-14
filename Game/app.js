var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var client = require('./client.js');

clientid=1;

app.use(express.static('public'));

app.get('/wait', function(req, res){
  res.sendfile(__dirname + '/public/waiting.html');
});

app.get('/main', function(req, res){
  res.sendfile(__dirname + '/public/main.html');
});

app.get('/play', function(req, res){
  res.sendfile(__dirname + '/public/indexf.html');
});

clientid = 1

io.on('connection', function(socket){
    
  socket.clientid = clientid;
  clientid++;
    
  console.log('a user connected');
  console.log('user id:' + socket.id);

  socket.on('data', function(data) {
  socket.emit('data', "hello from user " + socket.id)
 });
    
  socket.on('disconnect', function(){
    socket.emit('user disconnected');
  });
    
  socket.on('usercome', function(socket){
      socket.emit('usercome', socket.id);
  });
    
  socket.on('userClickCircle', function(nmb) {
      socket.broadcast.emit('userClickCircle', nmb)
    });
    
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});