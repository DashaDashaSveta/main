ws = new WebSocket ('ws://localhost:8031');

ws.onmessage = function (message) {
	// приводим ответ от сервера в пригодный вид 
	var event = JSON.parse(message.data);
	// проверяем тип события 
	switch (event.type) {
		case 'message':
			// само сообщение
            //alert('message');
            var g = $('<p></p>'); 
	        g.text('from '+ event.from + ': ' + event.message); 
            $('#mes').append(g);
            //$('#mes').append($('<li>').text('from '+ event.from + ': ' + event.message));
			
			break;
		case 'authorize':
			// ответ на запрос об авторизации
			if (event.success) {
                //оповещаем, что все хорошо
                alert('Auth is successful!');
			}
			break;
		default: 
			// заносим в лог сообщение об ошибке сервера
			console.log ('unknown event:', event)
			break;
	}
}

//обработка авторизации - посылаем серверу данные о новом пользователе через вебсокет
$('#accept').on('click', function(e) {
    //alert('accept button');
    ws.send (JSON.stringify ({
			type: 'authorize',
			user: $('#login').val(),
			password: $('#password').val()
		}));
});

//клиентская обработка посылки сообщения -посылаем серверу данные о сообщении через веб-сокет 
$('#send').on('click', function(e) {
    //alert('send button');
    ws.send (JSON.stringify ({
			type: 'message',
			message:$('#message_text').val()
		})); 
    //alert('Это в поле ввода: ' + $('#message_text').val());
    $('#message_text').val('');
});

