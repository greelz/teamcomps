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

def getPlayerGlobal():
    with open("playerGlobal.json", "r") as f:
        try:
            playerGlobal = json.load(f)
        except:
            playerGlobal = {}
    return playerGlobal

def startPulling(seedAccount, region = "na1"):
    maxNewPlayersToProcess = 10000
    playersToProcess = []
    playersProcessed = {}
    total_new_games = 0
    total_matches_reviewed = 0
    thread_count = 50
    playerGlobal = getPlayerGlobal()

    processStats = { "displayEveryNMins": 5, "time": d.unix_time_millis(), "new_games": 0, "matchesReviewed": 0 }

    if isinstance(seedAccount, str): 
        print("Grabbing accountId...")
        seedAccount = d.getAccountIdByName(seedAccount, region)

    playersToProcess.append(seedAccount)
    while True:
        accountId = playersToProcess.pop(0)
        if accountId not in playersProcessed:
            results = getAllGamesForAccountBySeason(accountId, region, "SEASON2019", playerGlobal)

            total_new_games += results[0]
            total_matches_reviewed += results[1]
            newPlayers = results[2]
           
            playersProcessed[accountId] = ""
            if len(playersToProcess) < maxNewPlayersToProcess:
                playersToProcess += [player for player in newPlayers if player not in playersToProcess and player not in playersProcessed]
            
            currTime = d.unix_time_millis()
            if currTime > (processStats["time"] + (60000 * processStats["displayEveryNMins"])):
                print("------\nTotal new games: " + str(total_new_games))
                print("Matches reviewed:  " + str(total_matches_reviewed))
                print(str(total_new_games - processStats["new_games"]) + " requests made over the last " + str(round((currTime - processStats["time"]) / 60000, 2)) + " minutes.")
                print("Next player to process: [" + str(playersToProcess[0]) + "]")
                processStats["matchesReviewed"] = total_matches_reviewed
                processStats["new_games"] = total_new_games
                processStats["time"] = currTime

def getChallengerAccountNames(region):
    req = d.getLeague("challenger", region)
    if req is not None:
        return [player["playerOrTeamName"] for player in req["entries"]]

def getMasterAccountNames(region):
    req = d.getLeague("master", region)
    if req is not None:
        return [player["playerOrTeamName"] for player in req["entries"]]

def getAllChallengerAndMastersGames(region):
    playerGlobal = {}
    challengerNames = getChallengerAccountNames(region)
    masterNames = getMasterAccountNames(region)
    allNames = list(set(challengerNames + masterNames))
    
    for playerName in allNames:
        print("Processing account: " + playerName + ".")
        getAllGamesForAccountBySeason(d.getAccountIdByName(playerName, region), region, "SEASON2018", playerGlobal)
        print("Done processing accountId " + playerName + ". Writing results to file.")
        with open("playerGlobal.json", "w") as f:
            json.dump(playerGlobal, f)

def processGames(matchIds, region):
    thread_count = 50
    thread_idx = 0
    thread_games = [[] for x in range(thread_count)]
    threads = [None] * thread_count
    results = [[0, 0, []] for x in range(thread_count)]
    for matchId in matchIds:
        if thread_idx >= thread_count:
            thread_idx = 0
        thread_games[thread_idx].append(matchId)
        thread_idx += 1
    
    # Now, spawn the threads and wait for them to do work
    for i in range(thread_count):
        threads[i] = threading.Thread(target=getGameResults, args=(thread_games[i], region, results[i],))
        threads[i].start()

    for thread in threads:
        thread.join()

    return results

def getGameResults(matchIds, region, resultList):
    for matchId in matchIds:
        getGameResult(matchId, region, resultList)

    if len(resultList[2]) == 0 and len(matchIds) > 0:
        try:
            matchResponse = d.getMatch(matchIds[0], region)
            resultList[2] += getPlayersFromMatch(matchResponse.json)
        except (AttributeError, TypeError, KeyError):
            pass

def getGameResult(matchId, region, resultList):
    resultList[1] += 1
    if not checkFileExists(str(matchId) + ".json", "../../matchData/"):
        matchResponse = d.getMatch(matchId, region)
        resultList[2] += getPlayersFromMatch(matchResponse.json)
        resultList[0] += 1
        try:
            writeMatchToFile(matchResponse.json)
        except (AttributeError, TypeError, KeyError):
            pass

def getAllGamesForAccountBySeason(accountId, region, seasonName, playerGlobal):
    beginIndex = 0
    totalGames = 1
    total_new_games = 0
    total_matches_reviewed = 0
    all_new_players = []
    while beginIndex < totalGames:
        r = d.getMatchesByAccountId(accountId, region, d.RANKED_SOLO_QUEUE, str(beginIndex), str(beginIndex + 100), d._SEASONS[seasonName])
        if r is not None and r.json is not None:
            r = r.json
            if 'matches' in r:
                listOfGames = [match['gameId'] for match in r['matches']]

                if len(listOfGames) == 0:
                    playerGlobal[accountId] = { "lastIndex": beginIndex }
                    return [total_new_games, total_matches_reviewed, list(set(all_new_players))]

                results = processGames(listOfGames, region)

                for res in results:
                    total_new_games += res[0]
                    total_matches_reviewed += res[1]
                    all_new_players += res[2]

            beginIndex = r["endIndex"]
            totalGames = r["totalGames"]
        else:
            playerGlobal[accountId] = { "lastIndex": beginIndex }
            return [total_new_games, total_matches_reviewed, list(set(all_new_players))]

    playerGlobal[accountId] = { "lastIndex": beginIndex }
    return [total_new_games, total_matches_reviewed, list(set(all_new_players))]

def addPlayersFromMatch(match, new_players):
    for pId in match['participantIdentities']:
        player = pId['player']
        accountId = player['accountId']
        new_players.append(accountId)

def getPlayersFromMatch(match):
    new_players = []
    for pId in match['participantIdentities']:
        player = pId['player']
        accountId = player['accountId']
        new_players.append(accountId)
    return new_players

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

if __name__ == "__main__":
    startPulling("greelz", "na1")
