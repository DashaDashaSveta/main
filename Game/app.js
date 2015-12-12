var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var client = require('./client.js');

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendfile(__dirname + '/public/waiting.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
    var id = socket.id;
    client.addPlayer(id);
    console.log('user id:' + id);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});