var mysql = require('mysql');
var database = 'winlosseventfactwide';
var constants = require('./constants');
var pw='';

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
        if (champRiotIds[i] == -1) { continue; }
        
        clauses.push(`${getChampColumnName(i)} = ${champRiotIds[i]}`);
    }
    return `WHERE ${clauses.join(' AND ')}`
}

function getChampWhereClauseForNextBestChamp(champRiotIds)
{
    // callers should assume that the 0th element of the return array is shorter by 1
    // that first element is the passed in array
    var potentialColumnOrders = [];
    var potentialWhereClauses = [];
    var tempIds = [];
    
    for (var i = 0; i < champRiotIds.length; i++)
    {
        tempIds = [];
        for (var j = 0; j < champRiotIds.length; j ++)
        {
            if (j < i) { tempIds[j] = champRiotIds[j]; }
            else { tempIds[j+1] = champRiotIds[j]; }
        }
        potentialColumnOrders.push(tempIds);
        potentialWhereClauses.push(getChampWhereClauseForCacheTable(tempIds));
    }
    tempIds = [...champRiotIds];
    tempIds[champRiotIds.length] = -1;

    potentialColumnOrders.push(tempIds);

    // Adding this at the end let's us have a convenient order of
    // ChampOne, ChampTwo, ChampThree, ChampFour, ChampFive
    potentialWhereClauses.push(getChampWhereClauseForCacheTable(tempIds));


    return potentialWhereClauses;
}


function getSortedRiotIdsFromRequest(req)
{
    var champRiotIds = [];
    for (var element in req.body['champs'])
    {
        champRiotIds.push(parseInt(req.body['champs'][element]));
    }

    champRiotIds = champRiotIds.sort(function(a, b) {
        return a - b;  
    });; // make sure that we are in order
    return champRiotIds;
}

function getWinPercentage(req, callback)
{
    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : pw, // TODO config
        database : 'teamcomps_db' // TODO config
    });
    connection.connect();

    var champRiotIds = getSortedRiotIdsFromRequest(req);
    if (champRiotIds.length === 0)
    {
        return;
    }

    var selectStatement = `SELECT SUM(Wins) as wins, SUM(Losses) as losses FROM ${getCacheTableName(champRiotIds.length)} `
    var where = getChampWhereClauseForCacheTable(champRiotIds);
    var query = selectStatement + where;
    
    connection.query(query, function (err, result, fields) {
         if (err)
         {
            console.log(err);
         }
        var response = {'winPercent': result[0].wins / (result[0].wins + result[0].losses)};
        connection.end();

        return getNextTenBestChamps(req, callback, response);
    });    
}

function getNextTenBestChamps(req, callback, response)
{

    var champRiotIds = getSortedRiotIdsFromRequest(req);

    if (champRiotIds.length === 5 || champRiotIds.length === 0)
    {
        response.champIds = champRiotIds
        return callback(response);
    }
    
    var whereClauses = getChampWhereClauseForNextBestChamp(champRiotIds);
    var unionQueries = [];

    for (var i=0; i < whereClauses.length; i++)
    {
        var champColumn = getChampColumnName(i);
        var tempUnionQuery = `SELECT `+ 
        `SUM(Wins) as wins, SUM(Losses) as losses, ${champColumn} as champ ` + 
        `From ${getCacheTableName(champRiotIds.length + 1)} ` + 
        `${getChampWhereClauseForCacheTable(champRiotIds)} ` + // Function will automatically skip the column that is negative one
        `GROUP BY ${getChampColumnName(champRiotIds.length)} `
        unionQueries.push(tempUnionQuery)
    }

    var fullUnionQuery = unionQueries.join(" UNION ALL ");
    var query = `WITH lol AS (${fullUnionQuery}) SELECT SUM(wins) as wins, SUM(losses) as losses, champ FROM lol GROUP BY(champ)`

    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : pw, // TODO config
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
            if (champRiotIds.includes(result[i].champ)) { continue; }
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
        response.champIds = champRiotIds;
        console.log(response);
        connection.end();

        return callback(response);
    });   
}

module.exports = {
    getWinPercentage: getWinPercentage,
}
