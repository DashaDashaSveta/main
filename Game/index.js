var server = require("./server");
var router = require("./router");

var requestHandlers = require("./requestHandlers");

var handle = {}

handle["/Barsik"] = requestHandlers.Barsik;
handle["/Murzik"] = requestHandlers.Murzik;

server.start(router.route, handle);
server.hello();