import mysql.connector as msc
import threading

champNamesToRiotKeys = {'Annie': 1, 'Olaf': 2, 'Galio': 3, 'Twisted Fate': 4, 'Xin Zhao': 5, 'Urgot': 6, 'LeBlanc': 7, 'Vladimir': 8, 'Fiddlesticks': 9, 'Kayle': 10, 'Master Yi': 11, 'Alistar': 12, 'Ryze': 13, 'Sion': 14, 'Sivir': 15, 'Soraka': 16, 'Teemo': 17, 'Tristana': 18, 'Warwick': 19, 'Nunu & Willump': 20, 'Miss Fortune': 21, 'Ashe': 22, 'Tryndamere': 23, 'Jax': 24, 'Morgana': 25, 'Zilean': 26, 'Singed': 27, 'Evelynn': 28, 'Twitch': 29, 'Karthus': 30, "Cho'Gath": 31, 'Amumu': 32, 'Rammus': 33, 'Anivia': 34, 'Shaco': 35, 'Dr. Mundo': 36, 'Sona': 37, 'Kassadin': 38, 'Irelia': 39, 'Janna': 40, 'Gangplank': 41, 'Corki': 42, 'Karma': 43, 'Taric': 44, 'Veigar': 45, 'Trundle': 48, 'Swain': 50, 'Caitlyn': 51, 'Blitzcrank': 53, 'Malphite': 54, 'Katarina': 55, 'Nocturne': 56, 'Maokai': 57, 'Renekton': 58, 'Jarvan IV': 59, 'Elise': 60, 'Orianna': 61, 'Wukong': 62, 'Brand': 63, 'Lee Sin': 64, 'Vayne': 67, 'Rumble': 68, 'Cassiopeia': 69, 'Skarner': 72, 'Heimerdinger': 74, 'Nasus': 75, 'Nidalee': 76, 'Udyr': 77, 'Poppy': 78, 'Gragas': 79, 'Pantheon': 80, 'Ezreal': 81, 'Mordekaiser': 82, 'Yorick': 83, 'Akali': 84, 'Kennen': 85, 'Garen': 86, 'Leona': 89, 'Malzahar': 90, 'Talon': 91, 'Riven': 92, "Kog'Maw": 96, 'Shen': 98, 'Lux': 99, 'Xerath': 101, 'Shyvana': 102, 'Ahri': 103, 'Graves': 104, 'Fizz': 105, 'Volibear': 106, 'Rengar': 107, 'Varus': 110, 'Nautilus': 111, 'Viktor': 112, 'Sejuani': 113, 'Fiora': 114, 'Ziggs': 115, 'Lulu': 117, 'Draven': 119, 'Hecarim': 120, "Kha'Zix": 121, 'Darius': 122, 'Jayce': 126, 'Lissandra': 127, 'Diana': 131, 'Quinn': 133, 'Syndra': 134, 'Aurelion Sol': 136, 'Kayn': 141, 'Zoe': 142, 'Zyra': 143, "Kai'Sa": 145, 'Gnar': 150, 'Zac': 154, 'Yasuo': 157, "Vel'Koz": 161, 'Taliyah': 163, 'Camille': 164, 'Braum': 201, 'Jhin': 202, 'Kindred': 203, 'Jinx': 222, 'Tahm Kench': 223, 'Lucian': 236, 'Zed': 238, 'Kled': 240, 'Ekko': 245, 'Qiyana': 246, 'Vi': 254, 'Aatrox': 266, 'Nami': 267, 'Azir': 268, 'Yuumi': 350, 'Thresh': 412, 'Illaoi': 420, "Rek'Sai": 421, 'Ivern': 427, 'Kalista': 429, 'Bard': 432, 'Rakan': 497, 'Xayah': 498, 'Ornn': 516, 'Sylas': 517, 'Neeko': 518, 'Pyke': 555, 'Senna': 235}
# This is hacky, it's a dictionary that maps column number (shifted to start at the champ columns) to riot id.
wtf = {0: 266, 1: 103, 2: 84, 3: 12, 4: 32, 5: 34, 6: 1, 7: 22, 8: 136, 9: 268, 10: 432, 11: 53, 12: 63, 13: 201, 14: 51, 15: 164, 16: 69, 17: 31, 18: 42, 19: 122, 20: 131, 21: 36, 22: 119, 23: 245, 24: 60, 25: 28, 26: 81, 27: 9, 28: 114, 29: 105, 30: 3, 31: 41, 32: 86, 33: 150, 34: 79, 35: 104, 36: 120, 37: 74, 38: 420, 39: 39, 40: 427, 41: 40, 42: 59, 43: 24, 44: 126, 45: 202, 46: 222, 47: 145, 48: 429, 49: 43, 50: 30, 51: 38, 52: 55, 53: 10, 54: 141, 55: 85, 56: 121, 57: 203, 58: 240, 59: 96, 60: 7, 61: 64, 62: 89, 63: 127, 64: 236, 65: 117, 66: 99, 67: 54, 68: 90, 69: 57, 70: 11, 71: 21, 72: 82, 73: 25, 74: 267, 75: 75, 76: 111, 77: 518, 78: 76, 79: 56, 80: 20, 81: 2, 82: 61, 83: 516, 84: 80, 85: 78, 86: 555, 87: 246, 88: 133, 89: 497, 90: 33, 91: 421, 92: 58, 93: 107, 94: 92, 95: 68, 96: 13, 97: 113, 98: 235, 99: 35, 100: 98, 101: 102, 102: 27, 103: 14, 104: 15, 105: 72, 106: 37, 107: 16, 108: 50, 109: 517, 110: 134, 111: 223, 112: 163, 113: 91, 114: 44, 115: 17, 116: 412, 117: 18, 118: 48, 119: 23, 120: 4, 121: 29, 122: 77, 123: 6, 124: 110, 125: 67, 126: 45, 127: 161, 128: 254, 129: 112, 130: 8, 131: 106, 132: 19, 133: 62, 134: 498, 135: 101, 136: 5, 137: 157, 138: 83, 139: 350, 140: 154, 141: 238, 142: 115, 143: 26, 144: 142, 145: 143}
# Generates a <choose> concept from the provided list of champion ids
# e.g., given [1, 2, 3], it'll return [[1], [1, 2], [1, 2, 3], [2, 3], [2], [3], [1, 3]]
def calculateCacheComps(champIds):
    # champIds is riot keys
    cacheComps = []
    for champ in champIds:
        tempComps = []
        for comp in cacheComps:
            temp = []
            temp = comp.copy()
            temp.append(str(champ))
            tempComps.append(temp)
        
        cacheComps.extend(tempComps)
        cacheComps.append([str(champ)])
    return cacheComps


def processFunction(cursor):
    cacheDict = {}
    count = 0
    row = cursor.fetchone()
    matchIds = [] 

    while row is not None:
        count += 1
        rowChamps = []
        rowCacheComps = []
        
        is_win, match_id, patch, region, duration = row[:5]

        for idx, champ in enumerate(row[5:]):
            if champ == 1 or champ == "":
                rowChamps.append(wtf[idx])
        
        rowChamps.sort()

        matchIds.append(match_id)

        rowCacheComps = calculateCacheComps(rowChamps)
        for comp in rowCacheComps:
            # region patch champs
            tempKey = ",".join(sorted(comp))
            tempKey += "|" + str(patch) + "|" + str(region)
            if tempKey not in cacheDict:
                # Tuple of (wins, games)
                cacheDict[tempKey] = [0, 0]

            if str(is_win) == '1':
                cacheDict[tempKey][0] += 1
            else:
                cacheDict[tempKey][1] += 1

        row = cursor.fetchone()
    return cacheDict

def doInserts(cacheDict, cursor):
    singleChampValues = []
    doubleChampValues = []
    tripleChampValues = []
    quadChampValues = []
    quintChampValues = []
    for key in cacheDict:
        splits = key.split("|")
        champs = [int(x) for x in splits[0].split(",")]
        champs.sort()
        patch = ".".join(splits[1].split(".")[:2])
        region = splits[2]
        
        if len(champs) == 1:
            singleChampValues.append((champs[0], patch, region, cacheDict[key][1], cacheDict[key][0]))
        elif len(champs) == 2:
            doubleChampValues.append((champs[0], champs[1], patch, region, cacheDict[key][1], cacheDict[key][0]))
        elif len(champs) == 3:
            tripleChampValues.append((champs[0], champs[1], champs[2], patch, region, cacheDict[key][1], cacheDict[key][0]))
        elif len(champs) == 4:
            quadChampValues.append((champs[0], champs[1], champs[2], champs[3], patch, region, cacheDict[key][1], cacheDict[key][0]))
        elif len(champs) == 5:
            quintChampValues.append((champs[0], champs[1], champs[2], champs[3], champs[4], patch, region, cacheDict[key][1], cacheDict[key][0]))
    
    singleThread = threading.Thread(target = insertor, args = ("singlecache", " (ChampOne, Patch, Region, Losses, Wins) ", singleChampValues))
    doubleThread = threading.Thread(target = insertor, args = ("doublecache", " (ChampOne, ChampTwo, Patch, Region, Losses, Wins) ", doubleChampValues))
    tripleThread = threading.Thread(target = insertor, args = ("triplecache", " (ChampOne, ChampTwo, ChampThree, Patch, Region, Losses, Wins) ", tripleChampValues))
    quadThread = threading.Thread(target = insertor, args = ("quadruplecache", " (ChampOne, ChampTwo, ChampThree, ChampFour, Patch, Region, Losses, Wins) ", quadChampValues))
    quintThread = threading.Thread(target = insertor, args = ("quintuplecache", " (ChampOne, ChampTwo, ChampThree, ChampFour, ChampFive, Patch, Region, Losses, Wins) ", quintChampValues))
    
    threads = [singleThread, doubleThread, tripleThread, quadThread, quintThread]
    [t.start() for t in threads]
    [t.join() for t in threads]


def insertor( table_name, columns, values):
    tempCon = msc.Connect(user = 'root', password = 'banana', host = '127.0.0.1', database = 'teamcomps_db', port =3306)
    cursor = tempCon.cursor(buffered = True)
    len_thing = len(columns.split(","))
    query = "INSERT INTO " + table_name + columns + "VALUES (" + "%s," * (len_thing - 1) + "%s) ON DUPLICATE KEY UPDATE Wins = Wins + VALUES(Wins), Losses = Losses + VALUES(Losses)"

    cursor.executemany(query, values)
    

rowCount = 0
if __name__ == "__main__":
    mySQLConn = msc.Connect(user = 'root', password = 'banana', host = '127.0.0.1', database = 'teamcomps_db', port =3306)
    cursor = mySQLConn.cursor(buffered=True)
    max_queries = 50000
    count = 0
    iteration = 0
    while True:
        print("Processing, iteration #" + str(count + 1))
        # Grab 1000 rows to do processing on
        cursor.execute("SELECT * FROM winlosseventfactwide LIMIT " + str(max_queries) + " OFFSET " + str(max_queries * count))
        # If we don't have anything, then we should be done (exit the function)
        # After closing the cursor...
    
        if cursor.rowcount == 0:
            cursor.close()
            mySQLConn.close()
            exit()

        # Process 1000 games
        dic = processFunction(cursor)

        # Execute queries to insert into cached DB
        doInserts(dic, cursor)

        # Increase count
        count += 1
        mySQLConn.commit()