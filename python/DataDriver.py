import DataPuller as d
import datetime
import os
import json
import importlib

def startPulling(seedAccountId = None, region = "na1"):
    #greelz account id is 208054926
    # start with some seed champion
    # append seed champion to playersProceessed list
    # get seed champion match list
    # for each match in seed champ Match list:
    #   add players to players to search for list (if they are not there and have not been processed)
    # for each player in player to process list

    waitTimes = {}
    matches = {}
    running_data = {}
    players_processed = {}
    playersToProcess = []
    matchesProcessed = {}
    count = 0
    new_games = 0
    test = 3

    # Callback function to print out some results while waiting
    def write_current_data():
        print("Writing current data to file...")
        if count > 0:
            print("Percent new data: " + str(new_games / count))
        running_data['players_processed'] = players_processed
        running_data['playersToProcess'] = playersToProcess
        running_data['matches_processed'] = matches_processed
        with open("running_data.json", "w") as f:
            json.dump(running_data, f)

    ''' Check to see if we can grab the running data files. 
        If so, then start from that information so we can get a 
        head start. Otherwise, append the seedId so we start with 
        something.
    '''
    if seedAccountId is None:
        with open("running_data.json", "r") as f:
            running_data = json.load(f)
            if 'players_processed' in running_data:
                players_processed = running_data['players_processed']
            if 'playersToProcess' in running_data:
                playersToProcess = running_data['playersToProcess']
            if 'matches_processed' in running_data:
                matches_processed = running_data['matches_processed']
            if len(playersToProcess) == 0:
                playersToProcess.append(seedAccountId)
    else:
        playersToProcess.append(seedAccountId)
        matches_processed = {}
        players_processed = {}

    ''' This will loop pretty much forever. I don't expect us to hit
        many breaking points, except to switch out the API key (since 
        it refreshes every day until we get a permanent key). Not sure 
        if I'm a huge fan of the while True, but oh well.
    '''
    while True:
        accountId = playersToProcess.pop()
        matchList = getAccountMatchList(accountId, region, write_current_data);       
        
        if matchList:
            for matchId in matchList:
                count += 1
                if str(matchId) not in matches_processed:
                    matches_processed[str(matchId)] = 1
                    matchResponse = d.getMatch(matchId, region, write_current_data)
                    if matchResponse and matchResponse.json is not None:
                        addPlayersFromMatch(matchResponse.json, players_processed, playersToProcess)
                        new_game = log_match(matchResponse.json)
                        if new_game:
                            new_games += 1

                else:
                    print("Already processed game in this process: " + str(matchId))

            players_processed[accountId] = d.unix_time_millis(datetime.datetime.now())
            badLoopsInARow = 0


def addPlayersFromMatch(match, players_processed, playersToProcess):
    for pId in match['participantIdentities']:
        player = pId['player']
        accountId = player['accountId']
        # Do not add players we have already processed or are waiting to process
        if (accountId in players_processed) or (accountId in playersToProcess):
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
            print("Creating file: " + abspath)
        return True
    else:
        print("Hit an existing match: " + filename)
        return False
    

def log_match(match): 
    return writeMatchToFile(match)
    # And also add this to the database
    # Stop adding the matches to the dictionary, it doesn't really matter anyways
    #db.process_match(match)


def getAccountMatchList(accountId, region, callback):
    r = d.getMatchesByAccountId(accountId, region, callback, d.RANKED_SOLO_QUEUE)
    if r is not None and r.json is not None:
        r = r.json
        if 'matches' in r:
            return [match['gameId'] for match in r['matches']]

startPulling(217534405, "na1") # The Vero - NA


'''
#Start with Imaqtpie as a seed
ImaqtpieAccountID = 32639237
greelzId = 208054926
princess_caribou_id = 35062645
hide_on_bush_id = 3440481
bwipo_id = 37841420
mvp_max_id = 2238783

sRegion = "na1"
krRegion = "kr"
euwRegion = "euw1"
'''
