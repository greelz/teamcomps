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
var primes_up_to_5000 = generatePrimes(5000)

module.exports = function(app, db) {

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    // Get all games
    app.get("/winpercentage", (req, res) => {
        // req.query is a dictionary of parameters
        // Get the array of champ IDs
        var c1, c2, c3, c4, c5, prime_prod = 1;
        c1 = Number(req.query['champ1']);
        c2 = Number(req.query['champ2']);
        c3 = Number(req.query['champ3']);
        c4 = Number(req.query['champ4']);
        c5 = Number(req.query['champ5']);
        var champ_arr = [c1, c2, c3, c4, c5];

        for (var i = 0; i < 5; ++i) {
            // This makes use of NaN !== NaN, which is kinda unique to JS
            // However, we're guaranteed to have NaNs from the Number(...) coercion
            if (champ_arr[i]) prime_prod *= primes_up_to_5000[champ_arr[i] - 1];
        }
        
        db.collection("games").find( { comp_key : { $mod : [prime_prod, 0 ] } }).toArray(function(err, all_games) {
            var wins = 0, games = 0;
            console.log(all_games.length);
            for (i = 0; i < all_games.length; ++i)
            {
                if (all_games[i]["win"]) wins += 1;
                games += 1;
            }
            res.json(wins / games);
        });


    });
};
