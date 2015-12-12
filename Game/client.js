var players = []
function Player(){
    this.Id = players.length;
}

var addPlayer = function(id){
    var player = new Player();
    player.Id = id;
    players.push( player );
    return player;
};
module.exports.addPlayer = addPlayer;