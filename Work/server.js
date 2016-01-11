var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var assert = require('assert');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    console.log('i am working')
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
	
	// записываем ссылки на таблицы (коллекции) в глобальные переменные
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


// проверка пользователя на предмет существования в базе данных
function existUser (user, callback) {
    console.log('checking if it is exicting');
	userListDB.find({login: user}).toArray(function (error, list) {
		callback (list.length !== 0);
	});
}
// эта функция отвечает целиком за всю систему аккаунтов
function checkUser (user, password, callback) {
	// проверяем, есть ли такой пользователь
	existUser(user, function (exist) {
		// если пользователь существует
		if (exist) {
			// то найдем в БД записи о нем
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
			// не запрашиваем авторизацию, пускаем сразу
			callback (true);
		}
	});
}

// функция отправки сообщения всем
function broadcast (by, message) {
	
	// запишем в переменную, чтоб не расходилось время
	var time = new Date().getTime();
	console.log('sending time :' + message);
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
	// проинициализируем переменные
	var login = '';
	var registered = false;
	
	// при входящем сообщении
	ws.on('message', function (message) {
		// получаем событие в пригодном виде
		var event = JSON.parse(message);
		
		// если человек хочет авторизироваться, проверим его данные
		if (event.type === 'authorize') {
            console.log('auth');
            console.log('event');
            console.log(event);
			// проверяем данные
			checkUser(event.user, event.password, function (success) {
				// чтоб было видно в другой области видимости
				registered = success;
				
				// подготовка ответного события
				var returning = {type:'authorize', success: success};
				
				// если успех, то
				if (success) {
                    console.log('success auth')
					// добавим к ответному событию список людей онлайн
					returning.online = lpeers;
					
					// добавим самого человека в список людей онлайн
					lpeers.push (event.user);
					
					// добавим ссылку на сокет в список соединений
					peers.push (ws);
					
					// чтобы было видно в другой области видимости
					login = event.user;
					
					//  если человек вышел
					ws.on ('close', function () {
						peers.exterminate(ws);
						lpeers.exterminate(login);
					});
				}
				
				// ну и, наконец, отправим ответ
				ws.send (JSON.stringify(returning));
			
				// отправим старые сообщения новому участнику
				if (success) {
                    console.log('new mes to new user');
					sendNewMessages(ws);
				}
			});
		} else {
			// если человек не авторизирован, то игнорим его
			if (registered) {
				// проверяем тип события
				switch (event.type) {
					// если просто сообщение
					case 'message':
                        console.log('broadcasting message ' + event.message);    
						// рассылаем его всем
						broadcast (login, event.message)
						break;
					// если сообщение о том, что он печатает сообщение
					case 'type':
						// то пока я не решил, что делать в таких ситуациях
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

// убрать из массива элемент по его значению
Array.prototype.exterminate = function (value) {
	this.splice(this.indexOf(value), 1);
}
http.listen(8030, function(){
  console.log('listening on *:8030');
});