var express = require('express');
var router = express.Router();
var messageController = require('../processing/writeMatches.js');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
    res.send('post request received');
    messageController.printRequest(req);
    
});

router.post('/existence', function(req, res, next) {
    messageController.getUniqueGames(req).then(function(rows) {
        res.send(rows);
    }).catch((err) => setImmediate(() => { throw err; }));
});

module.exports = router;
