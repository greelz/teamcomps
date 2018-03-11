import DataPuller as d
import datetime
import os
import json
import importlib
import threading

def getMatchesProcessed():
    matches = {}
    for root, dirs, files in os.walk("../../matchData"):
        for filename in files:
            if filename.endswith(".json"):
                # Cut off the .json (5 characters)
                matches[filename[:-5]] = ""
    return matches

def startPulling(seedAccount, region = "na1"):
    playersToProcess = []
    playersProcessed = {}
    count = 0
    new_games = 0
    matchesReviewed = 0
    thread_count = 50
    processStats = { "displayEveryNMins": 5, "time": d.unix_time_millis(), "new_games": 0, "matchesReviewed": 0 }

    if isinstance(seedAccount, str): 
        print("Grabbing accountId...")
        seedAccount = d.getAccountIdByName(seedAccount, region)

    playersToProcess.append(seedAccount)
    while True:
        accountId = playersToProcess.pop()
        if accountId not in playersProcessed:
            playersProcessed[accountId] = ""
            matchList = getAccountMatchList(accountId, region);       
            # Some players don't have a match list, which seems like a bug
            # since we found them from a previous players' match history...
            # But eh, doesn't matter too much. We'll just skip it.
            if matchList:
                # Initialize state variables
                thread_games = [[] for x in range(thread_count)]
                threads = [None] * thread_count
                results = [(0, 0, [])] * thread_count
                thread_idx = 0
                for matchId in matchList:
                    # Split the work evenly amongst the threads
                    # by divvying out matchIds on each thread_games index
                    count += 1
                    if thread_idx >= thread_count:
                        thread_idx = 0
                    thread_games[thread_idx].append(matchId)
                    thread_idx += 1
                
                # Now, spawn the threads and wait for them to do work
                for i in range(thread_count):
                    threads[i] = threading.Thread(target=doThreadWork, args=(thread_games[i], 
                               playersToProcess, region, results, i))
                    threads[i].start()

                for thread in threads:
                    thread.join()

                
                newGamesFromPlayer = sum([x[0] for x in results])
                newMatchesReviewed = sum([x[1] for x in results])
                if len(playersToProcess) < thread_count:
                    playersToProcess = list(set([item for x in results for item in x[2]]))
                
                new_games += newGamesFromPlayer
                matchesReviewed += newMatchesReviewed
                currTime = d.unix_time_millis()
                if currTime > (processStats["time"] + (60000 * processStats["displayEveryNMins"])):
                    print("------\nTotal new games: " + str(new_games))
                    print("Matches reviewed:  " + str(matchesReviewed))
                    print(str(new_games - processStats["new_games"]) + " requests made over the last " + str(round((currTime - processStats["time"]) / 60000, 2)) + " minutes.")
                    print("Next player to process: [" + str(playersToProcess[-1]) + "]")
                    processStats["matchesReviewed"] = matchesReviewed
                    processStats["new_games"] = new_games
                    processStats["time"] = currTime

            else:
                print("No match list. Moving onto next player.")

def doThreadWork(matchIds, playersToProcess, region, results, i):
    new_games = 0
    new_players = []
    for matchId in matchIds:
        # I think we're safe to set the variable since matchIds are guaranteed
        # to be unique for a specific player
        if not checkFileExists(str(matchId) + ".json", "../../matchData/"):
            matchResponse = d.getMatch(matchId, region)
            try:
                new_games += 1
                addPlayersFromMatch(matchResponse.json, new_players)
                writeMatchToFile(matchResponse.json)
            except (AttributeError, TypeError, KeyError):
                continue

    if len(new_players) == 0 and len(matchIds) > 0:
        try:
            matchResponse = d.getMatch(matchIds[0], region)
            addPlayersFromMatch(matchResponse.json, new_players)
        except (AttributeError, TypeError, KeyError):
            pass
        
    results[i] = (new_games, len(matchIds), new_players)

def addPlayersFromMatch(match, new_players):
    for pId in match['participantIdentities']:
        player = pId['player']
        accountId = player['accountId']
        # Do not add players we have already processed or are waiting to process
        new_players.append(accountId)

def checkFileExists(filename, directory):
    return os.path.isfile(os.path.join(str(directory), str(filename)))

# This function assumes the file does not exist...
def writeMatchToFile(match):
    matchId = match['gameId']
    filename = str(matchId) + '.json'
    directory = "../../matchData/"
    abspath = os.path.join(directory, filename)
    with open(abspath, 'w') as f:
        json.dump(match, f)
    
def getAccountMatchList(accountId, region):
    r = d.getMatchesByAccountId(accountId, region, d.RANKED_SOLO_QUEUE)
    if r is not None and r.json is not None:
        r = r.json
        if 'matches' in r:
            return [match['gameId'] for match in r['matches']]

if __name__ == "__main__":
    startPulling("xKungFuKenny", "na1")
