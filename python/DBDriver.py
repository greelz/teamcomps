import os
import json
import generatePrimes as gp
from pymongo import MongoClient
import datetime


"This module is meant to handle getting the pulled data from the files"

epoch = datetime.datetime.utcfromtimestamp(0)
prime_nums = gp.getPrimes(1000)
client = MongoClient().league

def loopOverFiles(directory):
    teamStats = {}
    for root, dirs, filenames in os.walk(directory):
        for filename in filenames:
            #get winners and losers
            fullFile = os.path.join(directory, filename)
            with open(fullFile, "r") as f:
                matchDict = json.load(f)
                teamDict = getWinnersAndLosers(matchDict)
                if "losers" and "winners" in teamDict:
                    loserTeamKey = champArrayToKey(teamDict["losers"])
                    winnerTeamKey = champArrayToKey(teamDict["winners"])
                else:
                    continue

            # Handle updating stats
            updateStatsDict(teamStats,teamDict["losers"], loserTeamKey,True)
            updateStatsDict(teamStats,teamDict["winners"], winnerTeamKey,False)
            
        else:
            continue

    return teamStats


def process_match(match_data):
    team_dict = getWinnersAndLosers(match_data)
    losers = {}
    winners = {}
    if "losers" and "winners" in team_dict:
        time = (datetime.datetime.now() - epoch).total_seconds() * 1000.0
        loserTeamKey = champArrayToKey(team_dict["losers"])
        winnerTeamKey = champArrayToKey(team_dict["winners"])
        losers["comp_key"] = loserTeamKey
        losers["game"] = match_data['gameId']
        losers["win"] = False
        losers["team_comp"] = team_dict["losers"]
        losers["time_of_entry"] = time

        winners["comp_key"] = winnerTeamKey
        winners["game"] = match_data['gameId']
        winners["win"] = True
        winners["team_comp"] = team_dict["winners"]
        winners["time_of_entry"] = time
        client.games.insert_many([winners, losers])

    return

def updateStatsDict(statsDict,champArr,team_key,isLoss):
    if isLoss:
        countKey = "lossCount"
    else:
        countKey = "winCount"

    if not team_key in statsDict:
        statsDict[team_key] = {}
        statsDict[team_key]["champs"] = champArr

    if not countKey in statsDict[team_key]:
        statsDict[team_key][countKey] = 0
    statsDict[team_key][countKey] += 1
        

def getWinnersAndLosers(matchDict):
    teamDict = {}
    winningChamps = []
    losingChamps = []
    winningTeamId = ""
    losingTeamId = ""
    
    for team in matchDict["teams"]:
        if "win" in team:
            if team["win"]=="Win":
                winningTeamId = team["teamId"]
            elif team["win"] == "Fail":
                losingTeamId = team["teamId"]

    if (winningTeamId == "") or (losingTeamId == ""):
        return "";

    #now find each participant that was on the winning team
    for participant in matchDict["participants"]:
        if participant["teamId"] == winningTeamId:
            winningChamps.append(participant["championId"])
        elif participant["teamId"] == losingTeamId:
            losingChamps.append(participant["championId"])

    teamDict["losers"]  = losingChamps
    teamDict["winners"] = winningChamps
    
    return teamDict;

#Take an array of five champs and create a key  for those champs
def champArrayToKey(champArray):
    key = 1
    for champ in champArray:
        key *= prime_nums[champ - 1]

    return key

def unix_time_millis(dt):
    return (dt - epoch).total_seconds() * 1000.0


'''
#team_files = loopOverFiles("../data/matchData")
with open("malone_is_great.json", "r") as f:
    team_files = json.load(f)

with open("malone_is_great2.json", "w") as f:
    for key in team_files:
        team_files[key]["champs_prime"] = int(key)
        client.malone.insert_one(team_files[key])
'''
