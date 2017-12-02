import os
import json


'This module is meant to handle getting the pulled data from the files'

def loopOverFiles(directory):
    teamStats = {}
    print(directory)
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            print(fileName)
            #get winners and losers
            fullFile = os.path.join(directory,filename)
            matchDict = json.load(open(fileName))
            teamDict = getWinnersAndLosers(matchDict)
            loserKey = champArrayToKey(teamDict['losers'])
            winnerKey = champArrayToKey(teamDict['winners'])

            # Handle updating stats
            updateStatsDict(teamStats,teamDict['losers'],True)
            updateStatsDict(teamStats,teamDict['winners'],False)
            
        else:
            continue

    return teamStats

def updateStatsDict(statsDict,champArr,key,isLoss):
    if isLoss:
        countKey = 'lossCount'

    else:
        countKey = 'winCount'
    if key in statsDict:
        statsDict[key]['lossCount'] += 1
    else:
        statsDict[key] = {}
        statsDict[key]['champs'] = champArr
        statsDict[key]['lossCount'] += 1
        

def getWinnersAndLosers(matchDict):
    teamDict = {}
    winningChamps = []
    losingChamps = []
    
    for team in matchDict['teams']:
        if team['win']=="Win":
            winningTeamId = team['teamId'];

        elif team['win'] == "Fail":
            losingTeamId = team['teamId'];

    if (winningTeamId == "") or (losingTeamId == ""):
        return "";

    #now find each participant that was on the winning team
    for participant in matchDict['participants']:
        if participant['teamId'] == winningTeamId:
            winningChamps.append(participant['championId']);
        elif participant['teamId'] == losingTeamId:
            losingChamps.append(participant['championId']);

    teamDict['losers']  = losingChamps
    teamDict['winners'] = winningChamps
    
    return teamDict;

#Take an array of five champs and create a key  for those champs
def champArrayToKey(champArray):
    c6 = chr(6)
    key = c6
    for champ in champArray:
        key = key + str(champ) + c6

    return key


loopOverFiles("C:\\Users\\jdantas\\Documents\\Personal\\Python\\lolBuild\\DataDumps\\MatchData")
