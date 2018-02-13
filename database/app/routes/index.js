'use strict';
var league_routes = require("./league_routes.js");

module.exports = function (app, db) {
    league_routes(app, db);
    // If we have other routes, put them here as well
};
