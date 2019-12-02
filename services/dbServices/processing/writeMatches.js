var constants = require('./constants');
var mysql = require('mysql');
var champNames = constants.getChampNames();


function printRequest(req)
{
    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : '', // TODO config
        database : 'teamcomps_db' // TODO config
    });

    connection.connect();
    var query=`REPLACE INTO winlosseventfactwide (${champNames.join(', ')}, IsWin, MatchId, Patch, Region, Duration) VALUES ?`;
    var inserts = [];
    var errorLogged = false;
   
    for (var element in req.body)
    {
        var entry = req.body[element];

        var row = generateChampValuesFromRequest(entry);
        row.push(entry['IsWin']);
        row.push(entry['MatchId']);
        row.push(entry['Patch']);
        row.push(entry['Region']);
        row.push(entry['Duration']);

        inserts.push(row);
    }
    
    connection.query(query, [inserts], function (err) {
         if (err)
         {
            console.log(err.message);
            if (!errorLogged)
            {
                console.log(query);
                errorLogged = true;
            }
            

         }
             
     }); 

    console.log('Successfully inserted matches!');
    
    // if we don't do this it can lead to too many connection errors
    connection.end()
}


function getUniqueGames(req) {
    var query = "select matchid from winlosseventfact where iswin and matchid in REPLACEME";

    var matchIds = [];
    for (var matchIdx = 0; matchIdx < req.body.length; ++matchIdx) {
        matchIds.push(req.body[matchIdx]);
    }
    console.log(matchIds);

    query = query.replace("REPLACEME", "(" + Array(matchIds.length).join("?,") + "?)");

    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : '', // TODO config
        database : 'teamcomps_db' // TODO config
    });

    connection.connect();
    return new Promise(function(resolve, reject) {
        connection.query(query, [matchIds], function(err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
    connection.end();

}

function generateChampValuesFromRequest(entry)
{
    var bitValues = [];
    var bitDict = constants.getChampBitDict();
    bitDict[entry['ChampOne']] = "";
    bitDict[entry['ChampTwo']] = "";
    bitDict[entry['ChampThree']] = "";
    bitDict[entry['ChampFour']] = "";
    bitDict[entry['ChampFive']] = "";

    for (var champName in bitDict)
    {
        bitValues.push(bitDict[champName]);
    }

    return bitValues;
}

module.exports = {
    printRequest: printRequest,
}
