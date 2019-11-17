var fs = require('fs');
var mysql = require('mysql');

function printRequest(req)
{
    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : 'banana', // TODO config
        database : 'teamcomps_db' // TODO config
    });

    connection.connect();
    var query='REPLACE INTO winlosseventfact (TeamComboKey, ChampOne, ChampTwo, ChampThree, ChampFour, ChampFive, IsWin, MatchId, TimeOfEntry, Patch, Region, Duration) VALUES ?';
    var inserts = [];
   
    for (var element in req.body)
    {
        var entry = req.body[element];
        var row = [entry['TeamComboKey'], entry['ChampOne'], entry['ChampTwo'], entry['ChampThree'], entry['ChampFour'], entry['ChampFive'], entry['IsWin'], entry['MatchId'], entry['TimeOfEntry'], entry['Patch'], entry['Region'], entry['Duration']];
        inserts.push(row);
    }
    
    connection.query(query, [inserts], function (err) {
         if (err)
             console.log(err.message);
     }); 

    console.log('Successfully inserted matches!');
    
    // if we don't do this it can lead to too many connection errors
    connection.end()
}
module.exports = {
    printRequest: printRequest,
}
