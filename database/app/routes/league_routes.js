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
    champ_arr = [c1, c2, c3, c4, c5].filter(Boolean);
    return champ_arr;
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

function getPrimeFactorization(val) {
    var primeFactors = [], primeVal, idx;
    if (val) {
        for (idx = 0; idx < primes_up_to_5000.length; ++idx) {
            primeVal = primes_up_to_5000[idx];
            if (val % primeVal === 0) {
                primeFactors.push(primeVal);
                val /= primeVal;
                idx = -1;
            }
            if (val === 1) return primeFactors;
        }
    }
}

function generateDataForChampComp(db, prime_prod, callback) {
    // We want to generate data for everything that we care about
    // Overall win percentage, total number of games
    // Every team comp, w/ { total_games: <n>, wins: <n>, ... }
    // Some way to dive into that value, maybe a get request key or something... for later

    var now = console.time("generateDataForChampComp"), game, wins = 0, games = 0, winPercent = 0,
            cursor = db.collection("games").find( { 'comp_key' : { $mod : [prime_prod, 0 ] } }),
            numGames = 0, champDictionary, champPrimeProd;
    champDictionary = { '_id': prime_prod };
    cursor.each( (err, game) => {
        // Let's stop at 20,000 games since that's a ton of results and
        // won't really affect the results too much (IMO)
        if (game && numGames < 20000) {
            numGames += 1;
            champPrimeProd = game['comp_key'];
            if (champDictionary[champPrimeProd] === undefined) {
                champDictionary[champPrimeProd] = { 'wins': 0, 'total_games': 0, "champArray": game['team_comp'] };
            }
            champDictionary[champPrimeProd]['total_games'] += 1;
            if (game['win']) { 
                champDictionary[champPrimeProd]['wins'] += 1;
                wins += 1;
            }
        }
        else { // cursor is exhausted, return the results here
            winPercent = wins / numGames;
            champDictionary["win_percent"] = winPercent;
            champDictionary["total_games"] = numGames;
            console.timeEnd("generateDataForChampComp");
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
            var result = { "total_games": dic["total_games"], "win_percent": dic["win_percent"], "given_champs": givenChamps };
            var keys = Object.keys(dic), len = keys.length, key;
            for (var i = 0; i < len; ++i) {
                key = keys[i];
                var games = dic[key]["total_games"];
                if (games) {
                    var wins = dic[key]["wins"];
                    if (wins) {
                        var winPercent = wins / games;
                    }
                    var champArray = dic[key]["champArray"];
                    result[champArray.join()] = { "wins": wins, "total_games": games };
                }
            }
            return result;
        }

        var prime_prod = getPrimeProductFromRequest(req);
        var givenChamps = parseRequest(req);
        generateDataForChampComp(db, prime_prod, (champDic) => {
            res.json(loopThroughResults(champDic, givenChamps));
        });
    });

    // Get all games and return a winning percentage
    app.get("/winpercentage", (req, res) => {
        var prime_prod = getPrimeProductFromRequest(req);
        generateDataForChampComp(db, prime_prod, (champDic) => {
            var winPercent = champDic["win_percent"];
            var totalGames = champDic["total_games"];
            res.json( { "win_percent": winPercent, "total_games": totalGames });
        });
    });


    // Provide the next best champ given a certain team composition
    app.get("/nextbestchamp", (req, res) => {
        // Returns the next best champion from a champion dictionary
        function nextBestChamp(givenChamps, prime_prod, champDic) {
            var champs = {}, keys = Object.keys(champDic), len = keys.length, key, subKey,
                newChamps, bestTotalGames, bestWinPercent = 0, bestWins, bestChamp, i, j, champion, 
                bestComps;
            for (i = 0; i < len; ++i) {
                key = keys[i];
                if (champDic[key]["champArray"]) {
                    newChamps = champDic[key]["champArray"].filter( (val) => {
                        return givenChamps.indexOf(val) === -1;
                    });
                    if (newChamps) {
                        for (j = 0; j < newChamps.length; ++j) {
                            champion = newChamps[j];
                            if (!(champion in champs)) {
                                champs[champion] = { "wins": 0, "total_games": 0, "comps": {} };
                            }
                            champs[champion]["comps"][champDic[key]["champArray"]] = 1;
                            champs[champion]["wins"] += champDic[key]["wins"];
                            champs[champion]["total_games"] += champDic[key]["total_games"];
                        }
                    }
                }
            }

            keys = Object.keys(champs); 
            len = keys.length;
            for (i = 0; i < len; ++i) {
                key = keys[i];
                total_games = champs[key]["total_games"];
                if (total_games > 10) {
                    wins = champs[key]["wins"];
                    winPercent = wins / total_games;
                    if (winPercent > bestWinPercent) {
                        bestWins = wins;
                        bestWinPercent = winPercent;
                        bestChamp = key;
                        bestTotalGames = total_games;
                        bestComps = champs[key]["comps"];
                    }
                }
            }
            return { "win_percent" : bestWinPercent, "champId" : bestChamp, "total_games" : bestTotalGames, "wins" : bestWins, "comps": bestComps };
        }
        var champArray = parseRequest(req);
        var prime_prod = getPrimeProductFromChampArray(champArray);
        generateDataForChampComp(db, prime_prod, (champDic) => {
            res.json(nextBestChamp(champArray, prime_prod, champDic));
        });
    });
}
