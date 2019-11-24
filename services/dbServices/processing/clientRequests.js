var mysql = require('mysql');
var database = 'winlosseventfactwide';
var constants = require('./constants');

var champs = constants.champDict;

var champNames = [];
for (var riotKey in champs)
{
    champNames.push(champs[riotKey]);
}

// 
function getNextChampionColumnSelectStatment(champNames)
{
    columnSelections = [];
    // SELECT
    // SUM(<champName>) as <champName>
    for (var champName in champNames)
    {
        var column = `SUM(${champName}) as ${champName}`;
        columnSelections.push(column);
    }
    return `SELECT ${columnSelections.join(',')} FROM ${databaseName}`;
}

function getCacheTableName(numChamps)
{
    switch(numChamps)
    {
        case 1:
            return 'singlecache';
        case 2:
            return 'doublecache';
        case 3:
            return 'triplecache';
        case 4:
            return 'quadruplecache';
        case 5:
            return 'quintuplecache';
    }
}

function getChampColumnName(colNum)
{
    var champColumnNames = ['ChampOne', 'ChampTwo', 'ChampThree', 'ChampFour', 'ChampFive'];
    return champColumnNames[colNum];
}

function getChampWhereClauseForCacheTable(champRiotIds)
{
    // Given an array of champ riot keys generate a where clause that limits the number of columns to those champions
    // ASSUMPTION: champRiotkeys is in order i.e. [148, 225, 300] not [300, 148, 225]

    var clauses = [];
    for (var i = 0; i < champRiotIds.length; i++)
    {
        clauses.push(`${getChampColumnName(i)} = ${champRiotIds[i]}`);
    }
    return `WHERE ${clauses.join(' AND ')}`
}

function getSortedRiotIdsFromRequest(req)
{
    var champRiotIds = [];
    for (var element in req.body['champs'])
    {
        champRiotIds.push(req.body['champs'][element]);
    }

    champRiotIds = champRiotIds.sort(); // make sure that we are in order
    return champRiotIds;
}

function getWinPercentage(req, callback)
{
    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : '', // TODO config
        database : 'teamcomps_db' // TODO config
    });
    connection.connect();

    var champRiotIds = getSortedRiotIdsFromRequest(req);

    var selectStatement = `SELECT SUM(Wins) as wins, SUM(Losses) as losses FROM ${getCacheTableName(champRiotIds.length)} `
    var where = getChampWhereClauseForCacheTable(champRiotIds);
    var query = selectStatement + where;
    
    console.log(query);

    connection.query(query, function (err, result, fields) {
         if (err)
         {
            console.log(err);
         }
         console.log(result);
        var response = {'winPercent': result[0].wins / (result[0].wins + result[0].losses)};
        console.log(response);
        connection.end();

        return getNextTenBestChamps(req, callback, response);
    });    
}

function getNextTenBestChamps(req, callback, response)
{

    var champRiotIds = getSortedRiotIdsFromRequest(req);

    if (champRiotIds.length === 5)
    {
        return callback(response);
    }

    var query = `SELECT SUM(Wins) as wins, SUM(Losses) as losses, ${getChampColumnName(champRiotIds.length)} as champ From ${getCacheTableName(champRiotIds.length + 1)} ${getChampWhereClauseForCacheTable(champRiotIds)} GROUP BY ${getChampColumnName(champRiotIds.length)}`

    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : '', // TODO config
        database : 'teamcomps_db' // TODO config
    });
    connection.connect();

    connection.query(query, function (err, result, fields) {
        if (err)
        {
           console.log(err);
        }

        var nextBestChampions = [];
        for (var i = 0; i < result.length; i ++)
        {
            var champPercentTuple = {};
            champPercentTuple.champId = result[i].champ;
            champPercentTuple.winPercent = (result[i].wins) / (result[i].wins + result[i].losses);
            nextBestChampions.push(champPercentTuple);
        }

        nextBestChampions.sort(function(a, b)
        {
            if(a.winPercent < b.winPercent)  { return 1; }
            else { return -1; }
        })

        response.nextBestChampions = nextBestChampions.slice(0,10);

        console.log(response);
        connection.end();

        return callback(response);
    });   
}

module.exports = {
    getWinPercentage: getWinPercentage,
}
