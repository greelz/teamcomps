var mysql = require('mysql');

function getWinPercentage(req, callback)
{
    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : 'banana', // TODO config
        database : 'teamcomps_db' // TODO config
    });
    connection.connect();

    var champClauses = [];

    for (var element in req.body['champs'])
    {
        var clause = generateChampWhereClause(req.body['champs'][element]);
        champClauses.push(clause);
    }

    var selectStatement = 'SELECT sum(IsWin = 1) / count(MatchId) AS winPercent FROM winlosseventfact '
    var where = 'WHERE ' + champClauses.join(" AND ");
    var query = selectStatement + where;
    var winPercent;
    console.log(query);

    connection.query(query, function (err, result, fields) {
        winPercent = result[0].winPercent;    
         if (err)
         {
            console.log(err);
         }
        var response = {'winPercent': winPercent}
        console.log(response);
        connection.end();

        return getNextTenBestChamps(req, callback, response);
    });    
}

function getNextTenBestChamps(req, callback, response)
{
    var connection = mysql.createConnection({
        host     : 'localhost', // TODO config
        user     : 'root', // TODO config
        password : 'banana', // TODO config
        database : 'teamcomps_db' // TODO config
    });
    connection.connect();

    var champClauses = [];

    for (var element in req.body['champs'])
    {
        var clause = generateChampWhereClause(req.body['champs'][element]);
        champClauses.push(clause);
    }

    var selectStatement = 'SELECT * FROM winlosseventfact '
    var where = 'WHERE ' + champClauses.join(" AND ");
    var query = "WITH relevantMatches as ( " + selectStatement + where + ` 
    ) Select champId, (sum(IsWin) / count(IsWin)) as winPercent from
    (
        SELECT ChampOne as champId, IsWin from relevantMatches union all
        SELECT ChampTwo, IsWin from relevantMatches union all
        SELECT ChampThree, IsWin from relevantMatches union all
        SELECT ChampFour, IsWin from relevantMatches union all
        Select ChampFive, IsWin from relevantMatches as subq0
        ) as subq1

        Group BY champId
        Order BY winPercent desc
        LIMIT 10;
    `;

    connection.query(query, function (err, result, fields) {
        if (err)
        {
           console.log(err);
        }
        console.log(result.length);
        var nextBestChampions = [];
        for (var i = 0; i < result.length; i ++)
        {
            var row = {"champId": result[i].champId, "winPercent": result[i].winPercent};
            nextBestChampions.push(row);
        }

        response.nextBestChampions = nextBestChampions;

        console.log(response);
        connection.end();

        return callback(response);
    });   
}

function generateChampWhereClause(champId)
{
    return "(ChampOne = " + champId + " OR ChampTwo = " + champId + " OR ChampThree = " + champId + " OR ChampFour = " + champId + " OR ChampFive = " + champId + " )";
}

module.exports = {
    getWinPercentage: getWinPercentage,
}
