var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongo = require('mongodb');
var sessions = require('client-sessions');

clientid=1;

//здесь options для сессии
var opts = { 
    requestKey: 'session',
    cookieName: 'session',
    secret: "abcde"
}
app.use(sessions(opts));

//подключаем статические файлы  
app.use(express.static('public'));

//на страницу ожидания
app.get('/wait', function(req, res){
  res.sendfile(__dirname + '/public/waiting.html');
});

app.get('/win', function(req, res){
  res.sendfile(__dirname + '/public/end_success.html');
});

app.get('/lose', function(req, res){
  res.sendfile(__dirname + '/public/end_lose.html');
});

//на главную страницу
app.get('/', function(req, res){
  if (req.session.user)
      {
          //return res.redirect('/wait');
          console.log('session!');
      }
  res.sendfile(__dirname + '/public/main.html');
});

//на страницу плэйграунда
app.get('/play', function(req, res){
  res.sendfile(__dirname + '/public/indexf.html');
});

//если фэйлануться
app.get('/fail', function(req, res){
  res.sendfile(__dirname + '/public/fail.html');
});

//парсим куки от браузера
function parseCookies(socket) {
    var list = {},
        rc = socket.handshake.headers.cookie;
    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    console.log(list);
    return list;
    
}

userslist = []
handledlist = [] //сюда складываем играющих пользователей, пока не используется
users_in_game = {}

clientid = 1
allclick = 0

//когда коннектится юзер, приходит сокет и мы с ним работаем    
io.on('connection', function(socket){
    console.log('connection!');
   parsed = parseCookies(socket);
   var decoded = sessions.util.decode(opts, parsed['session']);
    console.log('decoded: ');
    console.log(decoded);
    //userslist.push(decoded.content.user);
    console.log('userlist: ');
    var struct_user = { 'user': decoded.content.user, 'socket': socket.id}
    userslist.push(struct_user); //массив онлайн-юзеров
    console.log(userslist);
    
  socket.clientid = clientid;
  clientid++;
    
  console.log('a user connected: ' + socket.id);
  io.emit('usercome', userslist); //рассылка обновленного списка онлайн игроков

  socket.on('data', function(data) { //wtf, это что-то тестовое
    socket.broadcast.emit('data', data)
 });
    
  socket.on('disconnect', function(){ //если юзер уходит
    console.log('user disconected: ' + socket.id);
    userslist.pop(socket.id);
    io.emit('usercome',userslist);
  });
    
  socket.on('usercome', function(socket){
    socket.emit('usercome', userslist);
  });
    
  /*socket.on('newroom', function(connected_pair){
      handledlist.push(connected_pair);
      console.log('pair ' + connected_pair.id_to + ' and ' + connected_pair.id_from + ' is on the handled list');
  })*/
    
  socket.on('invite', function (pair){ //приходит от одного клиента id сокета другого и ы отправляем приглашалку другому
      socket.broadcast.to(pair.to).emit('invite_message', pair); // в pair лежат id сокетов двух пользователей + их имена
	 console.log('Вас приглашает юзер ' + pair.id_to + '. Принять приглашение?');
  });
  
  socket.on('invite_accepted', function(pair){
	  handledlist.push(pair);
	  console.log(pair.from + ' and ' + pair.to);
	  io.to(pair.to).emit('redirect', pair);
	  console.log('send redirect to ' + pair.from+pair.to);
	  io.to(pair.from).emit('redirect', pair);
	  console.log('send redirect from ' + pair.from+pair.to);
  });

 
  socket.on('join_game', function (data) {
      socket.game_id = data;
      socket.join(data);
      console.log('these gouys join us: ' + data);
  });
    
  socket.on('userClickCircle', function(nmb, all) { //игра
      if (all < 25){
            //socket.broadcast.emit('userClickCircle', nmb)
          socket.broadcast.to(socket.game_id).emit('userClickCircle', nmb);
          }
      else {
              socket.broadcast.emit('end','w');
              socket.emit('end', 'l');}
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

//зарегаться
app.post('/signup', function(req, res, next) {
    var collection = db.collection("users");
    var user = req.body.user || "";
    var passwd = req.body.password || "";
    console.log(req.body);
    if (!user || !passwd)
        return res.redirect('/fail');
    
    collection.insertOne({'user': user, 'passwd': passwd}, function(err, result) {
        console.log('try to insert to the database ');
        if (err) {
			console.log(err);
            return res.redirect('/fail');
		}
        req.session.user = user;
        res.redirect('/wait');
    });
    
});

//войти
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
        req.session.user = user;
        res.redirect('/wait');
    });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});