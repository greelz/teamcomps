import mysql.connector as msc
import threading
import time

def getWtf():
    # { 'Aatrox': { 'id': 'Aatrox', 'key': 266, 'name': <human readable> }, ... }
    champ_dictionary = json.load(open("assets/champions.json", "r"))['data']
    champions = sorted([key for key in champ_dictionary])
    # { 0: '266', 1: '103', 2: '84', ... 145: '143' }
    return { idx: champ_dictionary[champ_name]['key'] for idx, champ_name in enumerate(champions) }

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
    wtf = getWtf()

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
    tempCon = msc.Connect(user = 'root', password = '', host = '127.0.0.1', database = 'teamcomps_db', port =3306)
    cursor = tempCon.cursor(buffered = True)
    len_thing = len(columns.split(","))
    query = "INSERT INTO " + table_name + columns + "VALUES (" + "%s," * (len_thing - 1) + "%s) ON DUPLICATE KEY UPDATE Wins = Wins + VALUES(Wins), Losses = Losses + VALUES(Losses)"
    cursor.executemany(query, values)
    tempCon.commit()
    
if __name__ == "__main__":
    mySQLConn = msc.Connect(user = 'root', password = '', host = '127.0.0.1', database = 'teamcomps_db', port =3306)
    cursor = mySQLConn.cursor(buffered=True)
    max_queries = 50000
    count = 0
    iteration = 0
    start_time = time.time()

    while True:
        print("Processing, iteration #" + str(count + 1))
        # Grab 1000 rows to do processing on
        cursor.execute("SELECT * FROM winlosseventfactwide LIMIT " + str(max_queries) + " OFFSET " + str(max_queries * count))
        # If we don't have anything, then we should be done (exit the function)
        # After closing the cursor...
    
        # threads commit their own work
        if cursor.rowcount == 0:
            cursor.close()
            mySQLConn.close()
            print(f'- Ran for {str((time.time() - start_time)/60)} + minutes')
            exit()

        # Process 1000 games
        dic = processFunction(cursor)

        # Execute queries to insert into cached DB
        doInserts(dic, cursor)

        # Increase count
        count += 1
