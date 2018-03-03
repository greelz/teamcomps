import DataPuller as d
import datetime
import os
import json
import importlib

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
    matchesProcessed = {}
#    matchesProcessed = getMatchesProcessed()
    count = 0
    new_games = 0

    if seedAccount is not int:
        seedAccount = d.getAccountIdByName(seedAccount, region)

    playersToProcess.append(seedAccount)

    while True:
        accountId = playersToProcess.pop()
        if accountId not in playersProcessed:
            playersProcessed[accountId] = ""
            print("\nProcessing games for:\t" + d.getAccountNameById(accountId, region) + 
                  " [" + str(accountId) + "]")
            if count > 0:
                print("New games processed:\t" + str(new_games) +
                      " (" + str(round(100*(new_games/count), 1)) + "%)")

            matchList = getAccountMatchList(accountId, region);       
            # Some players don't have a match list, which seems like a bug
            # since we found them from a previous players' match history...
            # But eh, doesn't matter too much. We'll just skip it.
            if matchList:
                for matchId in matchList:
                    count += 1
                    if str(matchId) not in matchesProcessed:
                        matchesProcessed[str(matchId)] = ""
                        matchResponse = d.getMatch(matchId, region)
                        if matchResponse and matchResponse.json is not None:
                            addPlayersFromMatch(matchResponse.json, playersToProcess)
#writeMatchToFile(matchResponse.json)
                            new_games += 1
            else:
                print("No match list. Moving onto next player.")


def addPlayersFromMatch(match, playersToProcess):
    for pId in match['participantIdentities']:
        player = pId['player']
        accountId = player['accountId']
        # Do not add players we have already processed or are waiting to process
        if accountId in playersToProcess:
            continue
        else:
            ''' We really only want to have a max of 1000 players to process
                Otherwise, the json file grows exponentially
            '''
            if len(playersToProcess) < 1000:
                playersToProcess.append(accountId)
            else:
                playersToProcess = playersToProcess[:1000]

def writeMatchToFile(match):
    matchId = match['gameId']
    filename = str(matchId) + '.json'
    directory = "../../matchData/"
    abspath = os.path.join(directory, filename)
    if not os.path.isfile(abspath):
        with open(abspath, 'w') as f:
            json.dump(match, f)
        return True
    else:
        print("Hit an existing match, which is a bug. Please figure out why.\nFilename: " + filename)
        return False
    
def getAccountMatchList(accountId, region):
    r = d.getMatchesByAccountId(accountId, region, d.RANKED_SOLO_QUEUE)
    if r is not None and r.json is not None:
        r = r.json
        if 'matches' in r:
            return [match['gameId'] for match in r['matches']]

if __name__ == "__main__":
    startPulling("D1 Karma", "na1")
