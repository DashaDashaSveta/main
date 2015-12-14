function addToHist(s) {
	var g = $('<p></p>'); 
	g.text(s); 
	$('.loghistory').append(g);  
};

function addToLogBubbles(s) {
	var g = $('<p></p>'); 
	g.text(s); 
	$('.logbubbles').append(g);  
};

function clearHistr() {
	$('.loghistory').html('');
}

function setClickCount(g) {
	$('.clicksg').text(g); 
};

$('.ball_t').on('click', '.ball', function(){
    if (userClick < 3){
        userClick++;
        allClicks ++;
        setClickCount(userClick);
        //addToHist(' * вы кликнули по ' + $(this).attr('numh'));
        //addToLogBubbles(allClicks);
        //alert($(this).attr('numh'))
        $(this).css('background-color','rgb(255,255,255)'); 
        socket.emit('userClickCircle',$(this).attr('numh'), allClicks);
        }
    else{
        alert('You cannot hit more than 3 bubbles!');
    }
})

//$('#buttonclear').on('click', function() {
	//userClick = 0;
	//setClickCount(userClick);
	//clearHistr();
	//$('.ball').css('background-color','rgb(26, 246, 24)');
//})

$('#buttonsend').on('click', function() {
    //alert(userClick);
    socket.emit('data', userClick);
    //alert(' i send ' +userClick);
    userClick = 0;
    setClickCount(userClick);
})