var fs = require('fs');
var mysql = require('mysql');
var expectedChampCount = 145;

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'banana',
    database : 'teamcomps_db'
});

function AreChampsPopulated()
{
    connection.connect();

    var query = "SELECT COUNT(*) FROM champions;";
    var areChampsPopulated = false;
    connection.query(query, function(err, result, fields){
        if (err) throw err;
        console.log("RESULT: ");
        console.log(result);
        console.log("FIELDS");
        console.log(fields);
        // areChampsPopulated = (result == expectedChampCount);
    })

    return areChampsPopulated;
}

function ParseChampionFile(fullFilePath)
{
    console.log("1");
    if (!fs.existsSync(fullFilePath)) return;

    var rawData = fs.readFileSync(fullFilePath, 'utf8', (error) => console.log(error));
    var champData = JSON.parse(rawData);

    return champData['data'];
}
var myArgs = process.argv.slice(2);
var filePath = myArgs[0];

var champsToInsert = GetChampsToInsert(filePath);
InsertChampions(champsToInsert);
connection.end();


function GetChampsToInsert(filePath) {
    var champData = ParseChampionFile(filePath);
    var champsToInsert = new Array();
    for (var c in champData) {
        var name = champData[c]['name'];
        var id = champData[c]['key']; // riot key
        var primeKey = champData[c]['primeKey'];
        var champToInsert = new Array(primeKey, id, name);
        champsToInsert.push(champToInsert);
    }
    return champsToInsert;
}



function InitializeChamps()
{
    // returns true if champs are populated, false otherwise
    if (AreChampsPopulated()) { return true; }
    var champsToInsert = GetChampsToInsert('../../../python/assets/jschamp_data.json');
    InsertChampions(champsToInsert);

    connection.end();
    return false;
}


function InsertChampions(champsToInsert) {
    connection.connect();
    var query = 'INSERT INTO champions (PrimeKey, RiotKey, Name) VALUES ?';
    connection.query(query, [champsToInsert], function (err) {
        if (err)
            throw err;
    });
}

module.exports = {
    InitializeChamps: InitializeChamps,
}

