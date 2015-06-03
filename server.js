var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var nocache = require("./nocache");
var http = require("http").Server(app);
var auth = require("./auth");
var multer = require("multer");

app.use(bodyParser.json());

app.use(auth);
app.use(nocache);
app.use("/api/sessions", require("./controllers/api/sessions"));
app.use("/api/localitzacio",require("./controllers/api/localitzacio")());
app.use("/api/users", multer( {dest : "./assets/uploads/"}));
app.use("/api/users", require("./controllers/api/users"));
app.use("/",require("./controllers/static"));


var options = {
    root: __dirname + "/layouts"
};


var port = process.env.PORT || 8080;

http.listen(port, function() {
    console.log('Server listening on',port);
});

