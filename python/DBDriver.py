import os
import sys
from pathlib import Path
import json
import generatePrimes as gp
import mysql.connector as msc
from datetime import datetime
from datetime import timezone
import traceback


"This module is meant to handle getting the pulled data from the files"

prime_nums = gp.getPrimes(1000)

def loopOverFiles(directory):
    writeable_events = []
    num_processed = 0
    num_added = 0
    temp_events = []
    my_SQL_conn = msc.Connect(user = 'root', password='banana', host='127.0.0.1', database='teamcomps_db', port=3306)
    cursor = my_SQL_conn.cursor()

    for root, dirs, filenames in os.walk(directory):
        for filename in filenames:
            #get winners and losers
            num_processed += 1
            fullFile = os.path.join(directory, filename)
            
            with open(fullFile, "r") as f:
                try:
                    matchDict = json.load(f)
                    temp_events = process_match(matchDict) # seperate this line and the next so that we can keep count of "valid" matches
                    num_processed += 1
                    if (not temp_events):
                        continue # don't fail for malformed games
                    writeable_events.extend(temp_events)

                    if(len(writeable_events) >= 1000):
                        # write events to database, and clear the array
                        writeable_events.clear()
                        cursor.executemany(insert_matches_command(), writeable_events)
                        
                        
                except Exception as error:
                    print(fullFile)
                    traceback.print_exc()
                     

    if (writeable_events):
        cursor.executemany(insert_matches_command(), writeable_events)
    my_SQL_conn.commit()
    my_SQL_conn.close()
    print("Number matches processed: " + str(num_processed))

def process_match(match_data):
    team_dict = getWinnersAndLosers(match_data)
    if (not team_dict):
        return
    losers = {}
    winners = {}
    eventsToReturn = []
    if "losers" and "winners" in team_dict:
        time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        loserTeamKey = champArrayToKey(team_dict["losers"])
        winnerTeamKey = champArrayToKey(team_dict["winners"])
        
        eventsToReturn.append( 
            build_team_event_row(loserTeamKey, team_dict['losers'], False, match_data['gameId'], match_data['gameVersion'], time) 
            )
        eventsToReturn.append(
            build_team_event_row(winnerTeamKey, team_dict['winners'], True, match_data['gameId'], match_data['gameVersion'], time)
        )
    return eventsToReturn


def insert_matches_command():
    return """INSERT INTO winlosseventfact 
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
                        Patch 
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
                %(Patch)s
            )"""


def build_team_event_row(teamComboKey, champArr, isWin, matchId, patch, timeOfEntry):
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
        'Patch': patch
    }
    if (teamComboKey == 23038456099):
        print (team_event_row)
    return team_event_row

def getWinnersAndLosers(matchDict):
    teamDict = {}
    winningChamps = []
    losingChamps = []
    winningTeamId = ""
    losingTeamId = ""

    if not ("teams" in matchDict):
        print("woohoo")
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

def unix_time_millis(dt):
    return (dt - epoch).total_seconds() * 1000.0

matchDirectory = Path.cwd().parents

team_files = loopOverFiles("../../matchData/euw1")