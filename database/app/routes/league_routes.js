'use strict';
// league_routes.js
// Author:      Matt Greeley
// Description: Defines the league request routes
// Routes:      
//          /winpercentage - returns the winning percentage of 
//                           a given team composition
//          /nextbestchamp - returns next best champion, along
//                           with the winning percentage



// ------------ Request parsing ------------

function generatePrimes(num_primes) {
    var prime_list = [2], num = 3, is_prime, idx;
    while (prime_list.length < num_primes) {
        is_prime = true;
        for (idx = 0; idx < prime_list.length; idx += 1) {
            if (num % prime_list[idx] === 0) {
                is_prime = false;
                break;
            }
        }
        if (is_prime) {
            prime_list.push(num);
        }
        num += 2;
    }
    return prime_list;
}
var primes_up_to_5000 = generatePrimes(5000);

function parseRequest(req) {
    var c1, c2, c3, c4, c5, champ_arr;
    c1 = Number(req.query.champ1);
    c2 = Number(req.query.champ2);
    c3 = Number(req.query.champ3);
    c4 = Number(req.query.champ4);
    c5 = Number(req.query.champ5);
    champ_arr = [c1, c2, c3, c4, c5].filter(Boolean);
    return champ_arr;
}

function getPrimeProductFromChampArray(champArray) {
    var prime_prod = 1, i;
    for (i = 0; i < champArray.length; i += 1) {
        prime_prod *= primes_up_to_5000[champArray[i] - 1];
    }
    return prime_prod;
}

function getPrimeProductFromRequest(req) {
    var champArray = parseRequest(req);
    return getPrimeProductFromChampArray(champArray);
}

// ------------ End of request parsing ------------

// ------------ Generate championDictionary from request -----------
function generateDataForChampComp(db, prime_prod, callback) {
    // Returns a dictionary like this:
    // { '_id': primeProductOfGivenChamps, 
    //     '<champCompAsPrime>': {'wins': N, 'total_games': M, 'champArray': [id1, id2, id3, id4, id5]}
    // }
    var wins = 0, winPercent = 0, numGames = 0, champPrimeProd,
        cursor = db.collection("games").find({ 'comp_key' : { $mod : [prime_prod, 0 ]}}),
        champDictionary = { '_id': prime_prod };
    cursor.each(function (err, game) {
        if (!err && game) {
            numGames += 1;
            champPrimeProd = game.comp_key;
            if (champDictionary[champPrimeProd] === undefined) {
                champDictionary[champPrimeProd] = { 'wins': 0, 'total_games': 0, "champArray": game.team_comp };
            }
            champDictionary[champPrimeProd].total_games += 1;
            if (game.win) {
                champDictionary[champPrimeProd].wins += 1;
                wins += 1;
            }
        } else { // cursor is exhausted, return the results here
            winPercent = wins / numGames;
            champDictionary.win_percent = winPercent;
            champDictionary.total_games = numGames;
            callback(champDictionary);
        }
    });
}

// ------------ End of generate championDictionary from request -----------

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


    app.get("/winpercentage", function (req, res) {
        var prime_prod = getPrimeProductFromRequest(req);
        generateDataForChampComp(db, prime_prod, function (champDic) {
            var winPercent = champDic.win_percent,
                totalGames = champDic.total_games,
                championIds = parseRequest(req);
            res.json({ "win_percent": winPercent, "total_games": totalGames, "champIds": championIds });
        });
    });


    app.get("/nextbestchamp", function (req, res) {
        var champArray = parseRequest(req),
            prime_prod = getPrimeProductFromChampArray(champArray);
        generateDataForChampComp(db, prime_prod, function (champDic) {
            var champs = {}, keys = Object.keys(champDic), len = keys.length, key,
                newChamps, bestTotalGames, bestWinPercent = 0, bestWins, bestChamp, i, j, champion,
                listOfChampIds, wins, total_games, winPercent,
                filterFunction = function (val) { return champArray.indexOf(val) === -1; };

            for (i = 0; i < len; i += 1) {
                key = keys[i];
                listOfChampIds = champDic[key].champArray;
                if (listOfChampIds) {
                    newChamps = listOfChampIds.filter(filterFunction);
                    for (j = 0; j < newChamps.length; j += 1) {
                        champion = newChamps[j];
                        if (!champs[champion]) {
                            champs[champion] = { "wins": 0, "total_games": 0, "comps": {} };
                        }
                        champs[champion].wins += champDic[key].wins;
                        champs[champion].total_games += champDic[key].total_games;
                    }
                }
            }

            keys = Object.keys(champs);
            len = keys.length;
            for (i = 0; i < len; i += 1) {
                key = keys[i];
                total_games = champs[key].total_games;
                if (total_games > 20) {
                    wins = champs[key].wins;
                    winPercent = wins / total_games;
                    if (winPercent > bestWinPercent) {
                        bestWins = wins;
                        bestWinPercent = winPercent;
                        bestChamp = key;
                        bestTotalGames = total_games;
                    }
                }
            }
            res.json({ "win_percent" : bestWinPercent, "champId" : bestChamp, "total_games" : bestTotalGames, "wins" : bestWins, "champIds": champArray });
        });
    });
};

