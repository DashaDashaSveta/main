function addToHist(s) {
	var g = $('<p></p>'); // создаем элемент параграф
	g.text(s); // добавляем текст
	$('.loghistory').append(g); // добавляем к элементу 
};

function clearHistr() {
	$('.loghistory').html('');
}

function setClickCount(g) {
	$('.clicksg').text(g); // получаем элемент с классом "clicksg"
};
// в переводе с эльфийского значит: при клике на элемент с классом "ball" внутри элемента
// с классом "ball_t" сделать вотту функцию
$('.ball_t').on('click', '.ball', function(){
	userClick++;

	setClickCount(userClick);

	addToHist(' * вы кликнули по ' + $(this).attr('numh'));
    alert($(this).attr('numh'))
	$(this).css('background-color','rgb(10, 39, 47)'); // установим цвет кружка
    socket.emit('userClickCircle',$(this).attr('numh') );
})

// при клике на кнопку очистить
$('#buttonclear').on('click', function() {
	userClick = 0;
	setClickCount(userClick);
	clearHistr();
	$('.ball').css('background-color','rgb(26, 246, 24)');
})
