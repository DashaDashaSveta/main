var http = require("http");
var url = require("url");

function start(route, handle) {
	  function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
        var queryData = url.parse(request.url, true).query;        
		console.log("Request for " + pathname + " received.");
          
        if (queryData.name) {
            response.end('Hello ' + queryData.name + '\n');
            console.log(queryData);
            routeFun(handle, queryData, response)
            } else {
                response.end("Hello World\n");
            }
		
		route(handle, pathname, response);
		
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end();
	  }

	  http.createServer(onRequest).listen(8888);
	  console.log("Server has started.");
}

function hello(){
	console.log("This is hello function")
}


exports.start = start;
exports.hello = hello;