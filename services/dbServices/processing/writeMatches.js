var constants = require('./constants');
var mysql = require('mysql');
var champNames = constants.getChampNames();

password = '';

function printRequest(req)
{
    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : password, // TODO config
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
    var query = "SELECT matchid FROM winlosseventfactwide WHERE iswin AND matchid IN (?)";

    var matchIds = [];
    for (var matchIdx = 0; matchIdx < req.body.length; ++matchIdx) {
        matchIds.push(req.body[matchIdx]);
    }

    if (matchIds.length < 1) {
        return new Promise(function(resolve, reject) {
            resolve([]);
        });
    }

    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : password, // TODO config
        database : 'teamcomps_db' // TODO config
    });

    connection.connect();
    matchIdsAsSet = new Set(matchIds);
    matchIds = Array.from(matchIdsAsSet);
    return new Promise(function(resolve, reject) {
        connection.query(query, [matchIds], function(err, result) {
            if (err) {
                connection.end();
                return reject(err);
            }
            connection.end();
            var res = new Set();
            for (var elem = 0; elem < result.length; ++elem) {
                res.add(result[elem].matchid);
            }
            resolve(Array.from(difference(matchIdsAsSet, res)));
        });
    });
}

// Return everything in setA that isn't in setB
// For our example, these will be unique games that the DB doesn't have
function difference(setA, setB) {
    for (var elem of setB) {
        if (setA.has(elem)) {
            setA.delete(elem);
        }
    }
    return setA;
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
    getUniqueGames: getUniqueGames,
}
