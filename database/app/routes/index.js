'use strict';
var league_routes  = require("./league_routes.js");
var general_routes = require("./general_routes.js");

module.exports = function (app, db) {
    league_routes(app, db);
    general_routes(app, db);
};
