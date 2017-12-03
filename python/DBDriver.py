import os
import json
import generatePrimes as gp


'This module is meant to handle getting the pulled data from the files'

prime_nums = gp.getPrimes(139)
champions_to_primes = {}

current_prime = -1

def championsIdToPrime(champId):
    if champId in champions_to_primes:
        return champions_to_primes[champId]

    champion_to_primes_index += 1
    champion_to_primes[champId] = prime_nums[champion_to_primes]
    return prime_nums[champion_to_primes]
    

def loopOverFiles(directory):
    teamStats = {}
    for root, dirs, filenames in os.walk(directory):
        for filename in filenames:
            #get winners and losers
            fullFile = os.path.join(directory, filename)
            with open(fullFile, "r") as f:
                matchDict = json.load(f)
                teamDict = getWinnersAndLosers(matchDict)
                if 'losers' and 'winners' in teamDict:
                    loserKey = champArrayToKey(teamDict['losers'])
                    winnerKey = champArrayToKey(teamDict['winners'])
                else:
                    continue

            # Handle updating stats
            updateStatsDict(teamStats,teamDict['losers'], loserKey,True)
            updateStatsDict(teamStats,teamDict['winners'], winnerKey,False)
            
        else:
            continue

    return teamStats

def updateStatsDict(statsDict,champArr,key,isLoss):
    if isLoss:
        countKey = 'lossCount'
    else:
        countKey = 'winCount'

    if key in statsDict:
        if not countKey in statsDict[key]:
            statsDict[key][countKey] = 0
        statsDict[key][countKey] += 1
    else:
        statsDict[key] = {}
        statsDict[key]['champs'] = champArr
        if not countKey in statsDict[key]:
            statsDict[key][countKey] = 0
        statsDict[key][countKey] += 1
        

def getWinnersAndLosers(matchDict):
    teamDict = {}
    winningChamps = []
    losingChamps = []
    winningTeamId = ""
    losingTeamId = ""
    
    for team in matchDict['teams']:
        if 'win' in team:
            if team['win']=="Win":
                winningTeamId = team['teamId']
            elif team['win'] == "Fail":
                losingTeamId = team['teamId']

    if (winningTeamId == "") or (losingTeamId == ""):
        return "";

    #now find each participant that was on the winning team
    for participant in matchDict['participants']:
        if participant['teamId'] == winningTeamId:
            winningChamps.append(participant['championId'])
        elif participant['teamId'] == losingTeamId:
            losingChamps.append(participant['championId'])

    teamDict['losers']  = losingChamps
    teamDict['winners'] = winningChamps
    
    return teamDict;

#Take an array of five champs and create a key  for those champs
def champArrayToKey(champArray):
    for champ in champArray:
        key += str(championsIdToPrime(champ))

    return key


team_files = loopOverFiles("../data/matchData")


with open("jordan's data.json", "w") as f:
    json.dump(team_files, f)
