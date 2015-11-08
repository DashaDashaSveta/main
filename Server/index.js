var server = require("./server");

var testhello = require("./testexport")

server.start();
server.hello();

testhello.test();

server.hello();