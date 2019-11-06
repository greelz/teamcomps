var fs = require('fs');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'banana',
    database : 'teamcomps_db_test'
});

function printRequest(req)
{
    connection.connect();
    var query='INSERT INTO winlosseventfact (TeamComboKey, ChampOne, ChampTwo, ChampThree, ChampFour, ChampFive, IsWin, MatchId, TimeOfEntry, Patch, Region) VALUES ?';
    var inserts = [];
   
    for (var element in req.body)
    {
        var entry = req.body[element];
        var row = [entry['TeamComboKey'], entry['ChampOne'], entry['ChampTwo'], entry['ChampThree'], entry['ChampFour'], entry['ChampFive'], entry['IsWin'], entry['MatchId'], entry['TimeOfEntry'], entry['Patch'], entry['Region']];
        console.log(row);
        inserts.push(row);
    }
    
    connection.query(query, [inserts], function (err) {
         if (err)
             console.log(err);
     }); 
}
module.exports = {
    printRequest: printRequest,
}
