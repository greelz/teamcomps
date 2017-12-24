var champions = ["Wukong", "Jax", "Fiddlesticks", "Shaco", "Warwick", "Xayah", "Nidalee", "Zyra", "Kled", "Brand", "Rammus", "Illaoi", "Corki", "Braum", "Darius", "Tryndamere", "Miss Fortune", "Yorick", "Xerath", "Sivir", "Riven", "Orianna", "Gangplank", "Malphite", "Poppy", "Karthus", "Jayce", "Nunu", "Trundle", "Graves", "Zoe", "Gnar", "Lux", "Shyvana", "Renekton", "Fiora", "Jinx", "Kalista", "Fizz", "Kassadin", "Sona", "Irelia", "Viktor", "Rakan", "Kindred", "Cassiopeia", "Maokai", "Ornn", "Thresh", "Kayle", "Hecarim", "Kha'Zix", "Olaf", "Ziggs", "Syndra", "Dr. Mundo", "Karma", "Annie", "Akali", "Volibear", "Yasuo", "Kennen", "Rengar", "Ryze", "Shen", "Zac", "Talon", "Swain", "Bard", "Sion", "Vayne", "Nasus", "Kayn", "Twisted Fate", "Cho'Gath", "Udyr", "Lucian", "Ivern", "Leona", "Caitlyn", "Sejuani", "Nocturne", "Zilean", "Azir", "Rumble", "Morgana", "Taliyah", "Teemo", "Urgot", "Amumu", "Galio", "Heimerdinger", "Anivia", "Ashe", "Vel'Koz", "Singed", "Skarner", "Varus", "Twitch", "Garen", "Blitzcrank", "Master Yi", "Elise", "Alistar", "Katarina", "Ekko", "Mordekaiser", "Lulu", "Camille", "Aatrox", "Draven", "Tahm Kench", "Pantheon", "Xin Zhao", "Aurelion Sol", "Lee Sin", "Taric", "Malzahar", "Lissandra", "Diana", "Tristana", "Rek'Sai", "Vladimir", "Jarvan IV", "Nami", "Jhin", "Soraka", "Veigar", "Janna", "Nautilus", "Evelynn", "Gragas", "Zed", "Vi", "Kog'Maw", "Ahri", "Quinn", "LeBlanc", "Ezreal"]

var champions_dic = {"aatrox": 266, "ahri": 103, "akali": 84, "alistar": 12, "amumu": 32, "anivia": 34, "annie": 1, "ashe": 22, "aurelionsol": 136, "azir": 268, "bard": 432, "blitzcrank": 53, "brand": 63, "braum": 201, "caitlyn": 51, "camille": 164, "cassiopeia": 69, "chogath": 31, "corki": 42, "darius": 122, "diana": 131, "draven": 119, "drmundo": 36, "ekko": 245, "elise": 60, "evelynn": 28, "ezreal": 81, "fiddlesticks": 9, "fiora": 114, "fizz": 105, "galio": 3, "gangplank": 41, "garen": 86, "gnar": 150, "gragas": 79, "graves": 104, "hecarim": 120, "heimerdinger": 74, "illaoi": 420, "irelia": 39, "ivern": 427, "janna": 40, "jarvaniv": 59, "jax": 24, "jayce": 126, "jhin": 202, "jinx": 222, "kalista": 429, "karma": 43, "karthus": 30, "kassadin": 38, "katarina": 55, "kayle": 10, "kayn": 141, "kennen": 85, "khazix": 121, "kindred": 203, "kled": 240, "kogmaw": 96, "leblanc": 7, "leesin": 64, "leona": 89, "lissandra": 127, "lucian": 236, "lulu": 117, "lux": 99, "malphite": 54, "malzahar": 90, "maokai": 57, "masteryi": 11, "missfortune": 21, "monkeyking": 62, "mordekaiser": 82, "morgana": 25, "nami": 267, "nasus": 75, "nautilus": 111, "nidalee": 76, "nocturne": 56, "nunu": 20, "olaf": 2, "orianna": 61, "ornn": 516, "pantheon": 80, "poppy": 78, "quinn": 133, "rakan": 497, "rammus": 33, "reksai": 421, "renekton": 58, "rengar": 107, "riven": 92, "rumble": 68, "ryze": 13, "sejuani": 113, "shaco": 35, "shen": 98, "shyvana": 102, "singed": 27, "sion": 14, "sivir": 15, "skarner": 72, "sona": 37, "soraka": 16, "swain": 50, "syndra": 134, "tahmkench": 223, "taliyah": 163, "talon": 91, "taric": 44, "teemo": 17, "thresh": 412, "tristana": 18, "trundle": 48, "tryndamere": 23, "twistedfate": 4, "twitch": 29, "udyr": 77, "urgot": 6, "varus": 110, "vayne": 67, "veigar": 45, "velkoz": 161, "vi": 254, "viktor": 112, "vladimir": 8, "volibear": 106, "warwick": 19, "xayah": 498, "xerath": 101, "xinzhao": 5, "yasuo": 157, "yorick": 83, "zac": 154, "zed": 238, "ziggs": 115, "zilean": 26, "zoe": 142, "zyra": 143}

var champions_dicInv = {"1": "Annie", "2": "Olaf", "3": "Galio", "516": "Ornn", "5": "Xin Zhao", "6": "Urgot", "7": "LeBlanc", "8": "Vladimir", "9": "Fiddlesticks", "266": "Aatrox", "267": "Nami", "12": "Alistar", "13": "Ryze", "14": "Sion", "15": "Sivir", "16": "Soraka", "17": "Teemo", "18": "Tristana", "19": "Warwick", "20": "Nunu", "21": "Miss Fortune", "22": "Ashe", "23": "Tryndamere", "24": "Jax", "4": "Twisted Fate", "26": "Zilean", "27": "Singed", "28": "Evelynn", "29": "Twitch", "30": "Karthus", "31": "Cho'Gath", "32": "Amumu", "33": "Rammus", "34": "Anivia", "35": "Shaco", "36": "Dr. Mundo", "37": "Sona", "38": "Kassadin", "39": "Irelia", "40": "Janna", "41": "Gangplank", "42": "Corki", "43": "Karma", "44": "Taric", "45": "Veigar", "48": "Trundle", "10": "Kayle", "51": "Caitlyn", "53": "Blitzcrank", "54": "Malphite", "55": "Katarina", "56": "Nocturne", "57": "Maokai", "58": "Renekton", "59": "Jarvan IV", "60": "Elise", "61": "Orianna", "62": "Wukong", "63": "Brand", "64": "Lee Sin", "11": "Master Yi", "68": "Rumble", "69": "Cassiopeia", "72": "Skarner", "268": "Azir", "74": "Heimerdinger", "75": "Nasus", "76": "Nidalee", "77": "Udyr", "78": "Poppy", "79": "Gragas", "80": "Pantheon", "81": "Ezreal", "82": "Mordekaiser", "83": "Yorick", "84": "Akali", "85": "Kennen", "86": "Garen", "89": "Leona", "90": "Malzahar", "91": "Talon", "92": "Riven", "96": "Kog'Maw", "98": "Shen", "99": "Lux", "101": "Xerath", "102": "Shyvana", "103": "Ahri", "104": "Graves", "105": "Fizz", "106": "Volibear", "107": "Rengar", "110": "Varus", "111": "Nautilus", "112": "Viktor", "113": "Sejuani", "114": "Fiora", "115": "Ziggs", "117": "Lulu", "119": "Draven", "120": "Hecarim", "121": "Kha'Zix", "122": "Darius", "126": "Jayce", "127": "Lissandra", "131": "Diana", "133": "Quinn", "134": "Syndra", "136": "Aurelion Sol", "141": "Kayn", "142": "Zoe", "143": "Zyra", "67": "Vayne", "150": "Gnar", "25": "Morgana", "154": "Zac", "412": "Thresh", "157": "Yasuo", "161": "Vel'Koz", "163": "Taliyah", "420": "Illaoi", "421": "Rek'Sai", "427": "Ivern", "429": "Kalista", "432": "Bard", "201": "Braum", "202": "Jhin", "203": "Kindred", "164": "Camille", "222": "Jinx", "223": "Tahm Kench", "50": "Swain", "236": "Lucian", "238": "Zed", "240": "Kled", "497": "Rakan", "498": "Xayah", "245": "Ekko", "254": "Vi"}

function getBlankInputElement()
{
    var champion_elements = $$(".champion_input");
    for (var i = 0; i < champion_elements.length; ++i) {
        var elem = champion_elements[i];
        // Check to see if any element is null, and if so, focus on it
        if (elem.value === "") {
            return elem;
        }
    }
    return null;
}

function tryFocusOnBlankInput()
{
    var elem = getBlankInputElement();
    if (elem) {
        elem.focus();
        return true;
    }
    return false;
}

function addAnotherChampionSelector() 
{
    if (!tryFocusOnBlankInput()) {
        if ($$(".champion_input").length < 5 && getBlankInputElement() === null) {
            addChampionSearchElem();
        }
    }
}

function addChampionSearchElem() {
    var new_elem = document.createElement("input");
    addClass(new_elem, "champion_input");
    new_elem.placeholder = "Champion";
    autocomplete(new_elem, champions, addAnotherChampionSelector);
    $("#championList").insertAdjacentElement("beforeend", new_elem);
    new_elem.focus();
}

function search() {
    var champions = $$(".champion_input");
    var query = "";
    for (var node = 0; node < champions.length; ++node) {
        var champId = champions_dic[champions[node].value.toLowerCase().replace(" ","")]
        if (champId) {
            query += "&champ" + (node + 1) + "=" + champId;
        }
    }
    if (query.length > 0) {
        query = query.substring(1);
        callAjax("http://127.0.0.1:8000/bestcomp?" + query, searchResponse);
    }
}

function champIdsToName(champIdArr) {
    var res = [];
    for (var champ in champIdArr) {
        res.push(champions_dicInv[champIdArr[champ]]);
    }
    return res;
}

function searchResponse(response) {
    $("#recommendations").innerHTML = "";
    response = JSON.parse(response);
    var winPercent = response['win_percent'];
    var total_games = response['total_games'];
    var given_champs = response["given_champs"];
    $("#winPercentage").innerHTML = (winPercent * 100).toFixed(2);
    $("#totalGames").innerHTML = total_games;
    Object.keys(response).forEach(function(key) {
        champions = key.split(",");
        if (champions.length === 5) {
            champions = champions.sort(function(a, b) { 
                a = Number(a);
                b = Number(b);
                if (given_champs.indexOf(a) > -1) {
                    if (given_champs.indexOf(b) > -1) {
                        return a > b;
                    }
                    return -1;
                }
                return (given_champs.indexOf(b) > -1) ? 1 : 0;
            });
            drawNewResult(champIdsToName(champions), response[key]['wins'] / response[key]['total_games'], response[key]['total_games']);
        }
    });
}

function drawNewResult(champ_list, winningPercentage, totalGames) {
    var responseSection = $("#recommendations");
    var table = responseSection.querySelector("table");
    if (!table) {
        table = document.createElement("table");
        addClass(table, "resultTable");        
    }
    var row = document.createElement("tr");
    table.appendChild(row);
    for (var champ in champ_list) {
        if (champ_list[champ].length > 0) {
            var cell = document.createElement("td");
            var text = document.createTextNode(champ_list[champ]);
            cell.appendChild(text);
            row.appendChild(cell);
        }
    }
    
    // Winning percentage
    cell = document.createElement("td");
    row.appendChild(cell);
    addClass(cell, "winningPercentage");
    text = document.createTextNode(winningPercentage * 100 + "%");
    cell.appendChild(text);

    // Total games
    cell = document.createElement("td");
    row.appendChild(cell);
    text = document.createTextNode(totalGames);
    cell.appendChild(text);
    
    // Cool bar graph
    cell = document.createElement("td");
    row.appendChild(cell);
    addClass(cell, "barGraph");
    var winPercent = winningPercentage * 100;
    addClass(cell, winPercent < 47 ? "red" : winPercent < 51 ? "orange" : "green");
    
    
    // Add the table at the end
    responseSection.appendChild(table);
}

autocomplete($("#first_champion"), champions, addAnotherChampionSelector);


var responseFromDatabase = {
    championGroups: { "AhriFiddlesticksBlitzcrankMalphite": {
            "Yasuo": "50%", "Ezreal": "44%", "Caitlyn": "59%",
        }
    }
}


