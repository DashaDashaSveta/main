//var $ = document.getElementById.bind(document);
//function $(a){return document.getElementById(a)}

//$('#test').on('click', function() {
   //alert('Hello1');
//})

ws = new WebSocket ('ws://localhost:8031');


ws.onmessage = function (message) {
	// приводим ответ от сервера в пригодный вид 
	var event = JSON.parse(message.data);
	
	// проверяем тип события и выбираем, что делать
	switch (event.type) {
		case 'message':
			// рендерим само сообщение
            alert('message');
			/*var name = document.createElement('div');
			var icon = document.createElement('div');
			var body = document.createElement('div');
			var root = document.createElement('div');
			
			name.innerText = event.from;
			body.innerText = specials_in(event);
			
			root.appendChild(name);
			root.appendChild(icon);
			root.appendChild(body);*/
			
            //alert('from: ' + event.from);
            //alert('mess: ' + event.message);
            /*var g = $('<p></p>'); 
	        g.text('from '+ event.from + ': ' + event.message); 
			$('#messages').append(g);*/
             
            $('#mes').append($('<li>').text('from '+ event.from + ': ' + event.message));
			
			break;
		case 'authorize':
			// ответ на запрос об авторизации
			if (event.success) {
                alert('authorize');
				//$('#loginform').classList.remove('unauthorized');
			}
			break;
		default: 
			// если сервер спятил, то даем об себе этом знать
			console.log ('unknown event:', event)
			break;
	}
}

function specials_in (event) {
	var message = event.message;
	var moment = new Date(event.time);
	
        // получаем время в пригодном виде
	var time = (moment.getHours()<10)? '0'+moment.getHours() : moment.getHours();
		time = (moment.getMinutes()<10)? time+':0'+moment.getMinutes() : time+':'+moment.getMinutes();
		time = (moment.getSeconds()<10)? time+':0'+moment.getSeconds() : time+':'+moment.getSeconds();
	var date = (moment.getDate()<10)? '0'+moment.getDate() : moment.getDate();
		date = (moment.getMonth()<10)? date+'.0'+moment.getMinutes()+'.'+moment.getFullYear() : date+':'+moment.getMonth()+'.'+moment.getFullYear()
	
	
	/*message = message.replace(/\[time\]/gim, time);
	message = message.replace(/\[date\]/gim, date);
	*/
	return message;
}


/*function specials_out(message) {
	// /me
	message = message.replace(/\s*\/me\s/, $('#login').value+' ');
	
	return message;
}*/

// по нажатию Enter в поле ввода пароля  
/*$('#password').on('keypress', function (e) {
    ///alert('1');
    if (e.which == 13) {
        //alert('password');
        // отправляем серверу событие authorize
		ws.send (JSON.stringify ({
			type: 'authorize',
			user: $('#login').val(),
			password: $('#password').val()
		}));
    }
});*/

// по нажатию Enter в поле ввода текста
/*$('#input').on('keypress', function (e) {
    alert('Hello input press');
	// если человек нажал Ctrl+Enter или Shift+Enter, то просто создаем новую строку. 
	if (e.which == 13 && !e.ctrlKey && !e.shiftKey) {
        // отправляем серверу событие message
		ws.send (JSON.stringify ({
			type: 'message',
			message: specials_out($('#input').innerText)
		})); 
		$('#input').innerText = ''; // чистим поле ввода
    }
});*/

$('#accept').on('click', function(e) {
    alert('accept button');
    ws.send (JSON.stringify ({
			type: 'authorize',
			user: $('#login').val(),
			password: $('#password').val()
		}));
});

$('#send').on('click', function(e) {
    alert('send button');
    ws.send (JSON.stringify ({
			type: 'message',
			message:$('#input').val()
		})); 
    alert('Это в поле ввода: ' + $('#input').val());
    $('#input').value = ''; // чистим поле ввода
});


// скроллим вниз при новом сообщении
/*var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		var objDiv = $('#messages');
		objDiv.scrollTop = objDiv.scrollHeight;
	}); 
}).observe($('#messages'), { childList: true });*/