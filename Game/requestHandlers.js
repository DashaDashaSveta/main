var url = require("url");

function Cat(name, breed, age, bday, address){
    this.name = name;
    this.breed = breed;
    this.age = age;
    this.bday= bday;
    this.address = address;
    this.talk = "";
}


function Barsik(response, data) {
  console.log(data);
  response.writeHead(200, {"Content-Type": "text/plain"});
  var cat_example = new Cat("Barsik", "Siberian", 7, [10,05,2015], "C:\\University\\cats\\Barsik.jpg")
  response.write(JSON.stringify(cat_example));
  response.end();
}

function Murzik(response) {
  console.log("Request handler 'upload' was called.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  var cat_example = new Cat("Murzik", "No", 13, [2,11,2014], "C:\\University\\cats\\Murzik.jpg")
  response.write(JSON.stringify(cat_example));
  response.end();
}
exports.Barsik = Barsik;
exports.Murzik = Murzik;