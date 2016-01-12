var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var assert = require('assert');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    console.log('I am working')
    res.sendfile(__dirname + '/public/index_chat.html');
});

// создаем сервер
var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({port: 8031});

// соединение с БД
var MongoClient = require('mongodb').MongoClient,
	format = require('util').format;   

var userListDB, chatDB;

// подсоединяемся к БД
MongoClient.connect('mongodb://127.0.0.1:27017', function (err, db) {
	if (err) {throw err}
	// таблицы в БД
	userListDB = db.collection('users');
	chatDB = db.collection('chat');
    /*assert.equal(null, err);
    removeData(db, function() {
      db.close();
  });*/
});

var removeData = function(db, callback) {
   db.collection('chat').deleteMany( {}, function(err, results) {
      console.log(results);
      callback();
   });
};

// проверка пользователя есть он или нет в базе данных
function existUser (user, callback) {
    console.log('checking if it is exicting');
	userListDB.find({login: user}).toArray(function (error, list) {
		callback (list.length !== 0);
	});
}
function checkUser (user, password, callback) {
	// проверяем, есть ли такой пользователь
	existUser(user, function (exist) {
		// если пользователь существует
		if (exist) {
			// поиск в БД
			userListDB.find({login: user}).toArray(function (error, list) {
                console.log('finding user ' + user);
				// проверяем пароль
				callback (list.pop().password === password);
			});
		} else {
            console.log('insert user');
			// если пользователя нет, то регистрируем его
			userListDB.insert ({login: user, password: password}, {w:1}, function (err) {
				if (err) {throw err}
                console.log(user + password)
			});
			callback (true);
		}
	});
}

// функция отправки сообщения всем
function broadcast (by, message) {
	var time = new Date().getTime();
	console.log('sending time :' + time);
	// отправляем по каждому соединению
	peers.forEach (function (ws) {
		ws.send (JSON.stringify ({
			type: 'message',
			message: message,
			from: by,
			time: time
		}));
	});
	// сохраняем сообщение в истории
	chatDB.insert ({message: message, from: by, time: time}, {w:1}, function (err) {
        console.log('insert mes into db');
		if (err) {throw err}
	});
}

// при новом соединении 
wss.on('connection', function (ws) {	
    console.log('connected');
	var login = '';
	var registered = false;
	// при входящем сообщении
	ws.on('message', function (message) {
		var event = JSON.parse(message);
		//  проверим данные
		if (event.type === 'authorize') {
            console.log('auth');
            console.log('event');
            console.log(event);
			// проверяем данные
			checkUser(event.user, event.password, function (success) {
				registered = success;
				// ответ
				var returning = {type:'authorize', success: success};			
				// если успех, то
				if (success) {
                    console.log('success auth');
					returning.online = lpeers;					
					lpeers.push (event.user);
                    //оповещаем о новом юзере
					var strmes = '---> ' + event.user;
                    broadcast('system', strmes);
                    
					peers.push (ws);
					login = event.user;
					//  если человек вышел
					ws.on ('close', function () {
						peers.exterminate(ws);
						lpeers.exterminate(login);
					});
				}
                //ответ
				ws.send (JSON.stringify(returning));      
				//старые сообщения новому участнику
				if (success) {
                    console.log('new mes to new user');
					sendNewMessages(ws); 
				}
			});
		} else {
			if (registered) {
				switch (event.type) {
					case 'message':
                        //отправляем сообщение
                        console.log('broadcasting message ' + event.message);    
						broadcast (login, event.message)
						break;
					case 'type':
						break;
				}	
			}
		}
	});
});

// список участников чата (их логины)
var lpeers = [];
var peers = [];

// функция отправки старых сообщений новому участнику чата
function sendNewMessages (ws) {
	chatDB.find().toArray(function(error, entries) {
		if (error) {throw error}
		entries.forEach(function (entry){
			entry.type = 'message';
            console.log('send other messages to new user');
			ws.send (JSON.stringify (entry));
		});
	});
}

//вспомогательная
Array.prototype.exterminate = function (value) {
	this.splice(this.indexOf(value), 1);
}

//сервер
http.listen(8030, function(){
  console.log('listening on *:8030');
});