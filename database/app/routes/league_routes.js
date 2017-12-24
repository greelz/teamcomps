function generatePrimes(num_primes) {
    var prime_list = [2]
    var num = 3;
    while (prime_list.length < num_primes) {
        var is_prime = true;
        for (var idx = 0; idx < prime_list.length; ++idx) {
            if (num % prime_list[idx] === 0) {
                is_prime = false;
                break
            }
        }
        if (is_prime) {
            prime_list.push(num)
        }
        num += 2
    }
    return prime_list;
}
const primes_up_to_5000 = generatePrimes(5000)

function parseRequest(req) {
    var c1, c2, c3, c4, c5, champ_arr, actual_arr;
    c1 = Number(req.query['champ1']);
    c2 = Number(req.query['champ2']);
    c3 = Number(req.query['champ3']);
    c4 = Number(req.query['champ4']);
    c5 = Number(req.query['champ5']);
    return [c1, c2, c3, c4, c5].filter(Boolean);
}

function getPrimeProductFromRequest(req) {
    var champArray = parseRequest(req);
    return getPrimeProductFromChampArray(champArray);
}

function getPrimeProductFromChampArray(champArray) {
    var prime_prod = 1;
    for (var i = 0; i < champArray.length; ++i) {
        prime_prod *= primes_up_to_5000[champArray[i] - 1];
    }
    return prime_prod;
}

function generateDataForChampComp(db, prime_prod, callback) {
    // We want to generate data for everything that we care about
    // Overall win percentage, total number of games
    // Every team comp, w/ { total_games: <n>, wins: <n>, ... }
    // Some way to dive into that value, maybe a get request key or something... for later

    db.collection("games").find( { 'comp_key' : { $mod : [prime_prod, 0 ] } }).toArray(function(err, all_games) {
        if (!err) {
            var wins = 0, games = 0, winPercent = 0;
            var champDictionary = { '_id': prime_prod, 'total_games': all_games.length };
            for (i = 0; i < all_games.length; ++i) {
                var champPrimeProd = getPrimeProductFromChampArray(all_games[i]['team_comp']);
                if (champDictionary[champPrimeProd] === undefined) {
                    champDictionary[champPrimeProd] = { 'wins': 0, 'total_games': 0, "champArray": all_games[i]['team_comp'] };
                }
                champDictionary[champPrimeProd]['total_games'] += 1;
                if (all_games[i]["win"]) { 
                    champDictionary[champPrimeProd]['wins'] += 1;
                    wins += 1;
                }
            }
            winPercent = wins / all_games.length;
            
            champDictionary["win_percent"] = winPercent;
            db.collection("champData").insert(champDictionary);
            callback(champDictionary);
        }
    });
}

module.exports = function(app, db) {
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.get("/bestcomp", (req, res) => {
        // Really, we just want to return all the comps that have at least 5? games
        // So there's at least some sort of limit... though this means that we won't have any results for some champions until we have a lot more games (e.g., Aatrox)
        // We may want to look into getting results of only 3 or 4 champions, where the 5th champion is basically irrelevant. This would give us more results anyways... 
        // I think we want to do the prime factorization on the server here, but it doesn't really matter to me.
        function loopThroughResults(dic, givenChamps) {
            var result = { "total_games": dic["total_games"], "win_percent": dic["win_percent"], "given_champs": givenChamps }
            Object.keys(dic).forEach(function(key) {
                var games = dic[key]["total_games"];
                if (games) {
                    var wins = dic[key]["wins"];
                    var champArray = dic[key]["champArray"];
                    if (games && wins) {
                        var winPercent = wins / games;
                    }
                    result[champArray.join()] = { "wins": wins, "total_games": games };
                }
            });
            return result;
        }

        var prime_prod = getPrimeProductFromRequest(req);
        var givenChamps = parseRequest(req);
        db.collection("champData").find( { "_id": prime_prod }).toArray(function(err, findResult) {
            if (err) console.log(err);
            else {
                if (findResult.length === 0) {
                    generateDataForChampComp(db, prime_prod, (champDic) => {
                        res.json(loopThroughResults(champDic, givenChamps));
                    });
                }
                else {
                    // Because it's an array, we need to return the "first" (and only) result
                    res.json(loopThroughResults(findResult[0], givenChamps));
                }
            }
        });
    });

    // Get all games
    app.get("/winpercentage", (req, res) => {
        var prime_prod = getPrimeProductFromRequest(req);
        db.collection("champData").find( { "_id": prime_prod }).toArray(function(err, findResult) {
            if (err) console.log(err);
            else {
                if (findResult.length === 0) {
                    generateDataForChampComp(db, prime_prod, (champDic) => {
                        var winPercent = champDic["win_percent"];
                        var totalGames = champDic["total_games"];
                        res.json( { "win_percent": winPercent, "total_games": totalGames });
                    });
                }
                else {
                    // Because it's an array, we need to return the "first" (and only) result
                    var winPercent = findResult[0]["win_percent"];
                    var totalGames = findResult[0]["total_games"];
                    res.json( { "win_percent": winPercent, "total_games": totalGames });
                }
            }
        });
    });
}
