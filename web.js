var express = require('express');

var app = express.createServer(express.logger());

var fs = require('fs');
var output =  fs.readFileSync('index.html').toString('utf-8');
//var output = "What's up?";

app.get('/', function(request, response) {
  response.send(output);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
