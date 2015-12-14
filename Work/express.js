var express = require('express')
var url = require('url');
var app = express()

function Cat(name, breed, age, bday, address){
    this.name = name;
    this.breed = breed;
    this.age = age;
    this.bday= bday;
    this.address = address;
}

app.get('/', function (req, res) {
  var queryData = url.parse(req.url, true).query;    
  res.send('Hello! Its me. I was wandering if afetr all...')
  res.end();
})


app.get('/plus', function (req, res) {
  var queryData = url.parse(req.url, true).query;   
  var answer = parseInt(queryData.num1) + parseInt(queryData.num2);
  res.send(JSON.stringify(answer))
  res.end();
})

app.get('/minus', function (req, res) {
  var queryData = url.parse(req.url, true).query;   
  var answer = parseInt(queryData.num1) - parseInt(queryData.num2);
  /*res.send('Answer is: ' + queryData.num1 + " + " +queryData.num2 + " = "+ answer)*/
  res.send(JSON.stringify(answer))
  res.end();
})

app.get('/mult', function (req, res) {
  var queryData = url.parse(req.url, true).query;   
  var answer = parseInt(queryData.num1) * parseInt(queryData.num2);
  res.send(JSON.stringify(answer))
  res.end();
})

app.get('/div', function (req, res) {
  var queryData = url.parse(req.url, true).query;   
  var answer = parseInt(queryData.num1) / parseInt(queryData.num2);
  res.send(JSON.stringify(answer))
  res.end();
})

app.get('/Barsik', function(req, res) {
  var cat_example = new Cat("Barsik", "Siberian", 7, [10,05,2015], "C:\\University\\cats\\Barsik.jpg")
  res.send(JSON.stringify(cat_example));
  res.end();
})

app.get('/Murzik', function(req, res) {
  var cat_example = new Cat("Murzik", "No", 13, [2,11,2014], "C:\\University\\cats\\Murzik.jpg")
  res.send(JSON.stringify(cat_example));
  res.end();
})

var server = app.listen(8000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})