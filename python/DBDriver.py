import os
import sys
from pathlib import Path
import json
import generatePrimes as gp
from datetime import datetime
import traceback


"This module is meant to handle getting the pulled data from the files"

prime_nums =  gp.getPrimes(1000)


def process_match(match_data):
    team_dict = getWinnersAndLosers(match_data)
    if not team_dict:
        return

    eventsToReturn = []
    if "losers" and "winners" in team_dict:
        time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        loserTeamKey = champArrayToKey(team_dict["losers"])
        winnerTeamKey = champArrayToKey(team_dict["winners"])
        
        eventsToReturn.append( 
            build_team_event_row(loserTeamKey, team_dict['losers'], False, match_data['gameId'], 
            match_data['gameVersion'], time, str(match_data['platformId']), int(match_data['gameDuration'])) 
            )
        eventsToReturn.append(
            build_team_event_row(winnerTeamKey, team_dict['winners'], True, 
            match_data['gameId'], match_data['gameVersion'], time, str(match_data['platformId']), int(match_data['gameDuration']))
        )
    return eventsToReturn


def insert_matches_command():
    return """REPLACE INTO winlosseventfact 
            ( 
                        TeamComboKey, 
                        ChampOne, 
                        ChampTwo, 
                        ChampThree, 
                        ChampFour, 
                        ChampFive, 
                        IsWin, 
                        MatchId, 
                        TimeOfEntry, 
                        Patch,
                        Region,
                        Duration
            ) VALUES 
            (
                %(TeamComboKey)s,
                %(ChampOne)s, 
                %(ChampTwo)s, 
                %(ChampThree)s, 
                %(ChampFour)s, 
                %(ChampFive)s, 
                %(IsWin)s, 
                %(MatchId)s, 
                %(TimeOfEntry)s,
                %(Patch)s,
                %(Region)s,
                %(Duration)s,
            )
            ON DUPLICATE KEY UPDATE
            Region = VALUES(Region)"""


def build_team_event_row(teamComboKey, champArr, isWin, matchId, patch, timeOfEntry, region, duration):
    sortedChampArr = sorted(champArr)
    team_event_row = {
        'TeamComboKey': teamComboKey,
        'ChampOne': sortedChampArr[0],
        'ChampTwo': sortedChampArr[1],
        'ChampThree': sortedChampArr[2],
        'ChampFour': sortedChampArr[3],
        'ChampFive': sortedChampArr[4],
        'IsWin': isWin,
        'MatchId': matchId,
        'TimeOfEntry': timeOfEntry,
        'Patch': patch,
        'Region': region,
        'Duration': duration
    }
    
    return team_event_row

def getWinnersAndLosers(matchDict):
    teamDict = {}
    winningChamps = []
    losingChamps = []
    winningTeamId = ""
    losingTeamId = ""

    if not ("teams" in matchDict):
        return

    for team in matchDict["teams"]:
        if "win" in team:
            if team["win"]=="Win":
                winningTeamId = team["teamId"]
            elif team["win"] == "Fail":
                losingTeamId = team["teamId"]

    if (winningTeamId == "") or (losingTeamId == ""):
        return ""

    # now find each participant that was on the winning team
    for participant in matchDict["participants"]:
        if participant["teamId"] == winningTeamId:
            winningChamps.append(participant["championId"])
        elif participant["teamId"] == losingTeamId:
            losingChamps.append(participant["championId"])

    teamDict["losers"]  = losingChamps
    teamDict["winners"] = winningChamps
    
    return teamDict

# Take an array of five champs and create a key  for those champs
def champArrayToKey(champArray):
    key = 1
    for champ in champArray:
        key *= prime_nums[champ - 1]

    return key
