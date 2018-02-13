'use strict';
var championDictionary = JSON.parse('{"key": {"Hecarim": {"name": "Hecarim", "id": 120}, "Cassiopeia": {"name": "Cassiopeia", "id": 69}, "Kennen": {"name": "Kennen", "id": 85}, "Elise": {"name": "Elise", "id": 60}, "Lulu": {"name": "Lulu", "id": 117}, "Kayn": {"name": "Kayn", "id": 141}, "Shyvana": {"name": "Shyvana", "id": 102}, "Xerath": {"name": "Xerath", "id": 101}, "Jinx": {"name": "Jinx", "id": 222}, "Riven": {"name": "Riven", "id": 92}, "Galio": {"name": "Galio", "id": 3}, "Sejuani": {"name": "Sejuani", "id": 113}, "Gragas": {"name": "Gragas", "id": 79}, "Nami": {"name": "Nami", "id": 267}, "Jax": {"name": "Jax", "id": 24}, "Sivir": {"name": "Sivir", "id": 15}, "Blitzcrank": {"name": "Blitzcrank", "id": 53}, "Gangplank": {"name": "Gangplank", "id": 41}, "Braum": {"name": "Braum", "id": 201}, "Zac": {"name": "Zac", "id": 154}, "Karma": {"name": "Karma", "id": 43}, "Nocturne": {"name": "Nocturne", "id": 56}, "Swain": {"name": "Swain", "id": 50}, "Chogath": {"name": "Cho\'Gath", "id": 31}, "Taliyah": {"name": "Taliyah", "id": 163}, "Ziggs": {"name": "Ziggs", "id": 115}, "Pantheon": {"name": "Pantheon", "id": 80}, "Lux": {"name": "Lux", "id": 99}, "Kassadin": {"name": "Kassadin", "id": 38}, "Khazix": {"name": "Kha\'Zix", "id": 121}, "Sona": {"name": "Sona", "id": 37}, "Poppy": {"name": "Poppy", "id": 78}, "Vladimir": {"name": "Vladimir", "id": 8}, "Ryze": {"name": "Ryze", "id": 13}, "Nautilus": {"name": "Nautilus", "id": 111}, "Malphite": {"name": "Malphite", "id": 54}, "Yorick": {"name": "Yorick", "id": 83}, "Karthus": {"name": "Karthus", "id": 30}, "Leblanc": {"name": "LeBlanc", "id": 7}, "Talon": {"name": "Talon", "id": 91}, "LeeSin": {"name": "Lee Sin", "id": 64}, "Katarina": {"name": "Katarina", "id": 55}, "Fiddlesticks": {"name": "Fiddlesticks", "id": 9}, "Sion": {"name": "Sion", "id": 14}, "Skarner": {"name": "Skarner", "id": 72}, "KogMaw": {"name": "Kog\'Maw", "id": 96}, "Rammus": {"name": "Rammus", "id": 33}, "Zilean": {"name": "Zilean", "id": 26}, "Taric": {"name": "Taric", "id": 44}, "Jhin": {"name": "Jhin", "id": 202}, "Viktor": {"name": "Viktor", "id": 112}, "Nidalee": {"name": "Nidalee", "id": 76}, "Brand": {"name": "Brand", "id": 63}, "Ashe": {"name": "Ashe", "id": 22}, "MissFortune": {"name": "Miss Fortune", "id": 21}, "Bard": {"name": "Bard", "id": 432}, "Diana": {"name": "Diana", "id": 131}, "Zoe": {"name": "Zoe", "id": 142}, "Rumble": {"name": "Rumble", "id": 68}, "Aatrox": {"name": "Aatrox", "id": 266}, "Tryndamere": {"name": "Tryndamere", "id": 23}, "Maokai": {"name": "Maokai", "id": 57}, "Corki": {"name": "Corki", "id": 42}, "Shaco": {"name": "Shaco", "id": 35}, "Lissandra": {"name": "Lissandra", "id": 127}, "TahmKench": {"name": "Tahm Kench", "id": 223}, "Draven": {"name": "Draven", "id": 119}, "Nasus": {"name": "Nasus", "id": 75}, "MasterYi": {"name": "Master Yi", "id": 11}, "Illaoi": {"name": "Illaoi", "id": 420}, "Vi": {"name": "Vi", "id": 254}, "Fiora": {"name": "Fiora", "id": 114}, "Janna": {"name": "Janna", "id": 40}, "TwistedFate": {"name": "Twisted Fate", "id": 4}, "Udyr": {"name": "Udyr", "id": 77}, "Rakan": {"name": "Rakan", "id": 497}, "Lucian": {"name": "Lucian", "id": 236}, "MonkeyKing": {"name": "Wukong", "id": 62}, "Heimerdinger": {"name": "Heimerdinger", "id": 74}, "Warwick": {"name": "Warwick", "id": 19}, "Soraka": {"name": "Soraka", "id": 16}, "Kled": {"name": "Kled", "id": 240}, "Olaf": {"name": "Olaf", "id": 2}, "Malzahar": {"name": "Malzahar", "id": 90}, "Quinn": {"name": "Quinn", "id": 133}, "Caitlyn": {"name": "Caitlyn", "id": 51}, "Garen": {"name": "Garen", "id": 86}, "Syndra": {"name": "Syndra", "id": 134}, "Camille": {"name": "Camille", "id": 164}, "Orianna": {"name": "Orianna", "id": 61}, "RekSai": {"name": "Rek\'Sai", "id": 421}, "Gnar": {"name": "Gnar", "id": 150}, "Fizz": {"name": "Fizz", "id": 105}, "Velkoz": {"name": "Vel\'Koz", "id": 161}, "Azir": {"name": "Azir", "id": 268}, "Irelia": {"name": "Irelia", "id": 39}, "Urgot": {"name": "Urgot", "id": 6}, "Jayce": {"name": "Jayce", "id": 126}, "Kayle": {"name": "Kayle", "id": 10}, "Nunu": {"name": "Nunu", "id": 20}, "Evelynn": {"name": "Evelynn", "id": 28}, "Zed": {"name": "Zed", "id": 238}, "Singed": {"name": "Singed", "id": 27}, "Morgana": {"name": "Morgana", "id": 25}, "Shen": {"name": "Shen", "id": 98}, "AurelionSol": {"name": "Aurelion Sol", "id": 136}, "Zyra": {"name": "Zyra", "id": 143}, "Volibear": {"name": "Volibear", "id": 106}, "Alistar": {"name": "Alistar", "id": 12}, "Ekko": {"name": "Ekko", "id": 245}, "Ivern": {"name": "Ivern", "id": 427}, "Graves": {"name": "Graves", "id": 104}, "Veigar": {"name": "Veigar", "id": 45}, "Ornn": {"name": "Ornn", "id": 516}, "Renekton": {"name": "Renekton", "id": 58}, "Xayah": {"name": "Xayah", "id": 498}, "Rengar": {"name": "Rengar", "id": 107}, "Akali": {"name": "Akali", "id": 84}, "Ezreal": {"name": "Ezreal", "id": 81}, "Annie": {"name": "Annie", "id": 1}, "Teemo": {"name": "Teemo", "id": 17}, "JarvanIV": {"name": "Jarvan IV", "id": 59}, "Leona": {"name": "Leona", "id": 89}, "Varus": {"name": "Varus", "id": 110}, "Amumu": {"name": "Amumu", "id": 32}, "Tristana": {"name": "Tristana", "id": 18}, "Kalista": {"name": "Kalista", "id": 429}, "Ahri": {"name": "Ahri", "id": 103}, "DrMundo": {"name": "Dr. Mundo", "id": 36}, "Yasuo": {"name": "Yasuo", "id": 157}, "Thresh": {"name": "Thresh", "id": 412}, "Anivia": {"name": "Anivia", "id": 34}, "Kindred": {"name": "Kindred", "id": 203}, "XinZhao": {"name": "Xin Zhao", "id": 5}, "Vayne": {"name": "Vayne", "id": 67}, "Mordekaiser": {"name": "Mordekaiser", "id": 82}, "Trundle": {"name": "Trundle", "id": 48}, "Darius": {"name": "Darius", "id": 122}, "Twitch": {"name": "Twitch", "id": 29}}, "name": {"Hecarim": {"key": "Hecarim", "id": 120}, "Twisted Fate": {"key": "TwistedFate", "id": 4}, "Cassiopeia": {"key": "Cassiopeia", "id": 69}, "Kennen": {"key": "Kennen", "id": 85}, "Elise": {"key": "Elise", "id": 60}, "Lulu": {"key": "Lulu", "id": 117}, "Kayn": {"key": "Kayn", "id": 141}, "Shyvana": {"key": "Shyvana", "id": 102}, "Tahm Kench": {"key": "TahmKench", "id": 223}, "Ryze": {"key": "Ryze", "id": 13}, "Xerath": {"key": "Xerath", "id": 101}, "Aurelion Sol": {"key": "AurelionSol", "id": 136}, "Jinx": {"key": "Jinx", "id": 222}, "Riven": {"key": "Riven", "id": 92}, "Galio": {"key": "Galio", "id": 3}, "Sejuani": {"key": "Sejuani", "id": 113}, "Ashe": {"key": "Ashe", "id": 22}, "Nami": {"key": "Nami", "id": 267}, "Jax": {"key": "Jax", "id": 24}, "Sivir": {"key": "Sivir", "id": 15}, "Blitzcrank": {"key": "Blitzcrank", "id": 53}, "Gangplank": {"key": "Gangplank", "id": 41}, "Braum": {"key": "Braum", "id": 201}, "Zac": {"key": "Zac", "id": 154}, "Karma": {"key": "Karma", "id": 43}, "Nocturne": {"key": "Nocturne", "id": 56}, "Swain": {"key": "Swain", "id": 50}, "Malphite": {"key": "Malphite", "id": 54}, "Taliyah": {"key": "Taliyah", "id": 163}, "Ziggs": {"key": "Ziggs", "id": 115}, "Jhin": {"key": "Jhin", "id": 202}, "Lux": {"key": "Lux", "id": 99}, "Kassadin": {"key": "Kassadin", "id": 38}, "Sona": {"key": "Sona", "id": 37}, "Poppy": {"key": "Poppy", "id": 78}, "Vladimir": {"key": "Vladimir", "id": 8}, "Miss Fortune": {"key": "MissFortune", "id": 21}, "Nautilus": {"key": "Nautilus", "id": 111}, "Malzahar": {"key": "Malzahar", "id": 90}, "Yorick": {"key": "Yorick", "id": 83}, "Karthus": {"key": "Karthus", "id": 30}, "Talon": {"key": "Talon", "id": 91}, "Katarina": {"key": "Katarina", "id": 55}, "Fiddlesticks": {"key": "Fiddlesticks", "id": 9}, "Sion": {"key": "Sion", "id": 14}, "Skarner": {"key": "Skarner", "id": 72}, "Kog\'Maw": {"key": "KogMaw", "id": 96}, "Rammus": {"key": "Rammus", "id": 33}, "Zilean": {"key": "Zilean", "id": 26}, "Taric": {"key": "Taric", "id": 44}, "Viktor": {"key": "Viktor", "id": 112}, "Nidalee": {"key": "Nidalee", "id": 76}, "Vel\'Koz": {"key": "Velkoz", "id": 161}, "Master Yi": {"key": "MasterYi", "id": 11}, "Bard": {"key": "Bard", "id": 432}, "Diana": {"key": "Diana", "id": 131}, "Zoe": {"key": "Zoe", "id": 142}, "Rumble": {"key": "Rumble", "id": 68}, "Aatrox": {"key": "Aatrox", "id": 266}, "Tryndamere": {"key": "Tryndamere", "id": 23}, "Maokai": {"key": "Maokai", "id": 57}, "Gragas": {"key": "Gragas", "id": 79}, "Corki": {"key": "Corki", "id": 42}, "Shaco": {"key": "Shaco", "id": 35}, "Lissandra": {"key": "Lissandra", "id": 127}, "Draven": {"key": "Draven", "id": 119}, "Wukong": {"key": "MonkeyKing", "id": 62}, "Nasus": {"key": "Nasus", "id": 75}, "LeBlanc": {"key": "Leblanc", "id": 7}, "Illaoi": {"key": "Illaoi", "id": 420}, "Vi": {"key": "Vi", "id": 254}, "Xin Zhao": {"key": "XinZhao", "id": 5}, "Fiora": {"key": "Fiora", "id": 114}, "Janna": {"key": "Janna", "id": 40}, "Udyr": {"key": "Udyr", "id": 77}, "Rakan": {"key": "Rakan", "id": 497}, "Lucian": {"key": "Lucian", "id": 236}, "Heimerdinger": {"key": "Heimerdinger", "id": 74}, "Kayle": {"key": "Kayle", "id": 10}, "Soraka": {"key": "Soraka", "id": 16}, "Kled": {"key": "Kled", "id": 240}, "Olaf": {"key": "Olaf", "id": 2}, "Quinn": {"key": "Quinn", "id": 133}, "Caitlyn": {"key": "Caitlyn", "id": 51}, "Tristana": {"key": "Tristana", "id": 18}, "Garen": {"key": "Garen", "id": 86}, "Kha\'Zix": {"key": "Khazix", "id": 121}, "Camille": {"key": "Camille", "id": 164}, "Orianna": {"key": "Orianna", "id": 61}, "Gnar": {"key": "Gnar", "id": 150}, "Warwick": {"key": "Warwick", "id": 19}, "Azir": {"key": "Azir", "id": 268}, "Irelia": {"key": "Irelia", "id": 39}, "Urgot": {"key": "Urgot", "id": 6}, "Jayce": {"key": "Jayce", "id": 126}, "Pantheon": {"key": "Pantheon", "id": 80}, "Nunu": {"key": "Nunu", "id": 20}, "Evelynn": {"key": "Evelynn", "id": 28}, "Zed": {"key": "Zed", "id": 238}, "Singed": {"key": "Singed", "id": 27}, "Morgana": {"key": "Morgana", "id": 25}, "Rek\'Sai": {"key": "RekSai", "id": 421}, "Shen": {"key": "Shen", "id": 98}, "Zyra": {"key": "Zyra", "id": 143}, "Volibear": {"key": "Volibear", "id": 106}, "Alistar": {"key": "Alistar", "id": 12}, "Ekko": {"key": "Ekko", "id": 245}, "Ivern": {"key": "Ivern", "id": 427}, "Graves": {"key": "Graves", "id": 104}, "Veigar": {"key": "Veigar", "id": 45}, "Ornn": {"key": "Ornn", "id": 516}, "Renekton": {"key": "Renekton", "id": 58}, "Xayah": {"key": "Xayah", "id": 498}, "Rengar": {"key": "Rengar", "id": 107}, "Akali": {"key": "Akali", "id": 84}, "Ezreal": {"key": "Ezreal", "id": 81}, "Annie": {"key": "Annie", "id": 1}, "Teemo": {"key": "Teemo", "id": 17}, "Dr. Mundo": {"key": "DrMundo", "id": 36}, "Leona": {"key": "Leona", "id": 89}, "Varus": {"key": "Varus", "id": 110}, "Lee Sin": {"key": "LeeSin", "id": 64}, "Amumu": {"key": "Amumu", "id": 32}, "Syndra": {"key": "Syndra", "id": 134}, "Kalista": {"key": "Kalista", "id": 429}, "Ahri": {"key": "Ahri", "id": 103}, "Cho\'Gath": {"key": "Chogath", "id": 31}, "Yasuo": {"key": "Yasuo", "id": 157}, "Thresh": {"key": "Thresh", "id": 412}, "Fizz": {"key": "Fizz", "id": 105}, "Anivia": {"key": "Anivia", "id": 34}, "Kindred": {"key": "Kindred", "id": 203}, "Brand": {"key": "Brand", "id": 63}, "Vayne": {"key": "Vayne", "id": 67}, "Jarvan IV": {"key": "JarvanIV", "id": 59}, "Mordekaiser": {"key": "Mordekaiser", "id": 82}, "Trundle": {"key": "Trundle", "id": 48}, "Darius": {"key": "Darius", "id": 122}, "Twitch": {"key": "Twitch", "id": 29}}, "id": {"1": {"key": "Annie", "name": "Annie"}, "2": {"key": "Olaf", "name": "Olaf"}, "3": {"key": "Galio", "name": "Galio"}, "4": {"key": "TwistedFate", "name": "Twisted Fate"}, "5": {"key": "XinZhao", "name": "Xin Zhao"}, "6": {"key": "Urgot", "name": "Urgot"}, "7": {"key": "Leblanc", "name": "LeBlanc"}, "8": {"key": "Vladimir", "name": "Vladimir"}, "9": {"key": "Fiddlesticks", "name": "Fiddlesticks"}, "266": {"key": "Aatrox", "name": "Aatrox"}, "267": {"key": "Nami", "name": "Nami"}, "12": {"key": "Alistar", "name": "Alistar"}, "13": {"key": "Ryze", "name": "Ryze"}, "14": {"key": "Sion", "name": "Sion"}, "15": {"key": "Sivir", "name": "Sivir"}, "16": {"key": "Soraka", "name": "Soraka"}, "17": {"key": "Teemo", "name": "Teemo"}, "18": {"key": "Tristana", "name": "Tristana"}, "19": {"key": "Warwick", "name": "Warwick"}, "20": {"key": "Nunu", "name": "Nunu"}, "21": {"key": "MissFortune", "name": "Miss Fortune"}, "22": {"key": "Ashe", "name": "Ashe"}, "23": {"key": "Tryndamere", "name": "Tryndamere"}, "24": {"key": "Jax", "name": "Jax"}, "25": {"key": "Morgana", "name": "Morgana"}, "26": {"key": "Zilean", "name": "Zilean"}, "27": {"key": "Singed", "name": "Singed"}, "28": {"key": "Evelynn", "name": "Evelynn"}, "29": {"key": "Twitch", "name": "Twitch"}, "30": {"key": "Karthus", "name": "Karthus"}, "31": {"key": "Chogath", "name": "Cho\'Gath"}, "32": {"key": "Amumu", "name": "Amumu"}, "33": {"key": "Rammus", "name": "Rammus"}, "34": {"key": "Anivia", "name": "Anivia"}, "35": {"key": "Shaco", "name": "Shaco"}, "36": {"key": "DrMundo", "name": "Dr. Mundo"}, "37": {"key": "Sona", "name": "Sona"}, "38": {"key": "Kassadin", "name": "Kassadin"}, "39": {"key": "Irelia", "name": "Irelia"}, "40": {"key": "Janna", "name": "Janna"}, "41": {"key": "Gangplank", "name": "Gangplank"}, "42": {"key": "Corki", "name": "Corki"}, "43": {"key": "Karma", "name": "Karma"}, "44": {"key": "Taric", "name": "Taric"}, "45": {"key": "Veigar", "name": "Veigar"}, "48": {"key": "Trundle", "name": "Trundle"}, "50": {"key": "Swain", "name": "Swain"}, "51": {"key": "Caitlyn", "name": "Caitlyn"}, "53": {"key": "Blitzcrank", "name": "Blitzcrank"}, "54": {"key": "Malphite", "name": "Malphite"}, "55": {"key": "Katarina", "name": "Katarina"}, "56": {"key": "Nocturne", "name": "Nocturne"}, "57": {"key": "Maokai", "name": "Maokai"}, "58": {"key": "Renekton", "name": "Renekton"}, "59": {"key": "JarvanIV", "name": "Jarvan IV"}, "60": {"key": "Elise", "name": "Elise"}, "10": {"key": "Kayle", "name": "Kayle"}, "62": {"key": "MonkeyKing", "name": "Wukong"}, "63": {"key": "Brand", "name": "Brand"}, "64": {"key": "LeeSin", "name": "Lee Sin"}, "11": {"key": "MasterYi", "name": "Master Yi"}, "68": {"key": "Rumble", "name": "Rumble"}, "69": {"key": "Cassiopeia", "name": "Cassiopeia"}, "72": {"key": "Skarner", "name": "Skarner"}, "268": {"key": "Azir", "name": "Azir"}, "74": {"key": "Heimerdinger", "name": "Heimerdinger"}, "75": {"key": "Nasus", "name": "Nasus"}, "76": {"key": "Nidalee", "name": "Nidalee"}, "77": {"key": "Udyr", "name": "Udyr"}, "78": {"key": "Poppy", "name": "Poppy"}, "79": {"key": "Gragas", "name": "Gragas"}, "80": {"key": "Pantheon", "name": "Pantheon"}, "81": {"key": "Ezreal", "name": "Ezreal"}, "82": {"key": "Mordekaiser", "name": "Mordekaiser"}, "83": {"key": "Yorick", "name": "Yorick"}, "84": {"key": "Akali", "name": "Akali"}, "85": {"key": "Kennen", "name": "Kennen"}, "86": {"key": "Garen", "name": "Garen"}, "89": {"key": "Leona", "name": "Leona"}, "90": {"key": "Malzahar", "name": "Malzahar"}, "91": {"key": "Talon", "name": "Talon"}, "92": {"key": "Riven", "name": "Riven"}, "96": {"key": "KogMaw", "name": "Kog\'Maw"}, "98": {"key": "Shen", "name": "Shen"}, "99": {"key": "Lux", "name": "Lux"}, "101": {"key": "Xerath", "name": "Xerath"}, "102": {"key": "Shyvana", "name": "Shyvana"}, "103": {"key": "Ahri", "name": "Ahri"}, "104": {"key": "Graves", "name": "Graves"}, "105": {"key": "Fizz", "name": "Fizz"}, "106": {"key": "Volibear", "name": "Volibear"}, "107": {"key": "Rengar", "name": "Rengar"}, "110": {"key": "Varus", "name": "Varus"}, "111": {"key": "Nautilus", "name": "Nautilus"}, "112": {"key": "Viktor", "name": "Viktor"}, "113": {"key": "Sejuani", "name": "Sejuani"}, "114": {"key": "Fiora", "name": "Fiora"}, "115": {"key": "Ziggs", "name": "Ziggs"}, "117": {"key": "Lulu", "name": "Lulu"}, "119": {"key": "Draven", "name": "Draven"}, "120": {"key": "Hecarim", "name": "Hecarim"}, "121": {"key": "Khazix", "name": "Kha\'Zix"}, "122": {"key": "Darius", "name": "Darius"}, "126": {"key": "Jayce", "name": "Jayce"}, "127": {"key": "Lissandra", "name": "Lissandra"}, "131": {"key": "Diana", "name": "Diana"}, "133": {"key": "Quinn", "name": "Quinn"}, "134": {"key": "Syndra", "name": "Syndra"}, "136": {"key": "AurelionSol", "name": "Aurelion Sol"}, "141": {"key": "Kayn", "name": "Kayn"}, "142": {"key": "Zoe", "name": "Zoe"}, "143": {"key": "Zyra", "name": "Zyra"}, "67": {"key": "Vayne", "name": "Vayne"}, "150": {"key": "Gnar", "name": "Gnar"}, "154": {"key": "Zac", "name": "Zac"}, "412": {"key": "Thresh", "name": "Thresh"}, "157": {"key": "Yasuo", "name": "Yasuo"}, "161": {"key": "Velkoz", "name": "Vel\'Koz"}, "163": {"key": "Taliyah", "name": "Taliyah"}, "164": {"key": "Camille", "name": "Camille"}, "421": {"key": "RekSai", "name": "Rek\'Sai"}, "427": {"key": "Ivern", "name": "Ivern"}, "429": {"key": "Kalista", "name": "Kalista"}, "432": {"key": "Bard", "name": "Bard"}, "516": {"key": "Ornn", "name": "Ornn"}, "201": {"key": "Braum", "name": "Braum"}, "202": {"key": "Jhin", "name": "Jhin"}, "203": {"key": "Kindred", "name": "Kindred"}, "420": {"key": "Illaoi", "name": "Illaoi"}, "222": {"key": "Jinx", "name": "Jinx"}, "223": {"key": "TahmKench", "name": "Tahm Kench"}, "61": {"key": "Orianna", "name": "Orianna"}, "236": {"key": "Lucian", "name": "Lucian"}, "238": {"key": "Zed", "name": "Zed"}, "240": {"key": "Kled", "name": "Kled"}, "497": {"key": "Rakan", "name": "Rakan"}, "498": {"key": "Xayah", "name": "Xayah"}, "245": {"key": "Ekko", "name": "Ekko"}, "254": {"key": "Vi", "name": "Vi"}}}');