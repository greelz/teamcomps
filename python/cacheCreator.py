import mysql.connector as msc
import json

def getWtf():
    # { 'Aatrox': { 'id': 'Aatrox', 'key': 266, 'name': <human readable> }, ... }
    champ_dictionary = json.load(open("assets/champions.json", "r"))['data']
    champions = sorted([key for key in champ_dictionary])
    # { 0: '266', 1: '103', 2: '84', ... 145: '143' }
    sorted_name_to_key = { idx: champ_dictionary[champ_name]['key'] for idx, champ_name in enumerate(champions) }

def calculateCacheComps(champIds):
    # champIds is riot keys
    cacheComps = []
    for champ in champIds:
        tempComps = []
        for comp in cacheComps:
            temp = []
            temp = comp.copy()
            temp.append(champ)
            tempComps.append(temp)
        
        cacheComps.extend(tempComps)
        cacheComps.append([champ])
    return cacheComps

def main():
    mySQLConn = msc.Connect(user = 'root', password = '', host = '127.0.0.1', database = 'teamcomps_db', port = 3306)
    cursor = mySQLConn.cursor(buffered = True)
    cursor.execute("SELECT * FROM winlosseventfactwide limit 1") # bc jordan is a wimp

    res = {}
    cacheDict = {}

    row = cursor.fetchone()
    while row is not None:
        rowChamps = []
        rowCacheComps = []
        
        is_win, match_id, time_of_entry, patch, region, duration = row[:5]
        
        for idx, champ in enumerate(row[6:]):
            if champ == 1 or champ == "":
                rowChamps.append(sorted_name_to_key[idx])
        
        rowCacheComps = calculateCacheComps(rowChamps)

        for comp in rowCacheComps:
            tempKey = ",".join(sorted(comp))
            tempKey += "," + str(patch) + "," + str(region)
            # region patch champs
            if tempKey not in cacheDict:
                cacheDict[tempKey] = {'games': 0, 'wins': 0}

            if is_win:
                cacheDict[tempKey]['wins'] += 1

            cacheDict[tempKey]['games'] += 1

        row = cursor.fetchone()

    cursor.close()
