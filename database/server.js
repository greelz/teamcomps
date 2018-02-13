'use strict';
var express       = require("express");
var MongoClient   = require("mongodb").MongoClient;
var db            = require("./config/db");

var app           = express();
var port = 8000;

MongoClient.connect(db.url, function (err, database) {
    if (err) {
        return console.log(err);
    }
    require("./app/routes")(app, database);

    app.listen(port, function () {
        console.log("We are live on port " + port);
    });
});
