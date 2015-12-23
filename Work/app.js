var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongo = require('mongodb');

clientid=1;

app.use(express.static('public'));


app.get('/wait', function(req, res){
  res.sendfile(__dirname + '/public/waiting.html');
});

app.get('/', function(req, res){
  res.sendfile(__dirname + '/public/main.html');
});

app.get('/play', function(req, res){
  res.sendfile(__dirname + '/public/indexf.html');
});

app.get('/fail', function(req, res){
  res.sendfile(__dirname + '/public/fail.html');
});

clientid = 1
allclick = 0

io.on('connection', function(socket){
    
  socket.clientid = clientid;
  clientid++;
    
  console.log('a user connected: ' + socket.id);


  socket.on('data', function(data) {
    socket.broadcast.emit('data', data)
 });
    
  socket.on('disconnect', function(){
    socket.emit('user disconnected');
    console.log('user disconected: ' + socket.id)
  });
    
  socket.on('usercome', function(socket){
      socket.emit('usercome', socket.id);
  });
    

  socket.on('userClickCircle', function(nmb, all) {
      if (all < 25)
          {
            socket.broadcast.emit('userClickCircle', nmb)
          }
      else
          {
              socket.broadcast.emit('end',' You win :)');
              socket.emit('end', 'You lose :(')
          }
    });
    
});

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var mongo_connection = 'mongodb://127.0.0.1:27017/bubbles';
var db;

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

MongoClient.connect(mongo_connection, function(err, database) {
    if (err) throw err;
    db = database;
    db.collection("users").ensureIndex("user", {unique: true}, function(err, index) {
    if (err) throw err;
    });
})

app.post('/signup', function(req, res, next) {
    var collection = db.collection("users");
    var user = req.body.user || "";
    var passwd = req.body.password || "";
    console.log(req.body);
    if (!user || !passwd)
        return res.redirect('/fail');
    
    collection.insertOne({'user': user, 'passwd': passwd}, function(err, result) {
        console.log('try to insert to the database ');
        if (err)
            return res.redirect('/fail');
        res.redirect('/wait');
    });
});

app.post('/signin', function(req, res, next) {
    var collection = db.collection("users");
    var user = req.body.user || "";
    var passwd = req.body.password || "";
    console.log(req.body);
    if (!user || !passwd)
        return res.redirect('/fail');

    collection.findOne({'user': user}, function(err, item) {
        console.log(item)
        if (err || !item)
            return res.redirect('/fail');
        if (item.passwd != passwd)
            return res.redirect('/fail');
        res.redirect('/wait');
    });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});