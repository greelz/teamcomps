'use strict';

module.exports = function (app, db) {

    // This is necessary to test locally... but needs to be removed when
    // sent to production
    // #if debug
    app.use(function (ignore, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    // #enddebug

    app.get("/totalGames", function (req, res) {
        db.collection("games").count(function (err, result) {
            res.json(result);
        });
    });
};
