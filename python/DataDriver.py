import DataPuller as d
import time
import datetime
import os
import json
import importlib


'''
    startPulling   
'''
def startPulling(seedAccountId):
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

    ''' Check to see if we can grab the running data files. 
        If so, then start from that information so we can get a 
        head start. Otherwise, append the seedId so we start with 
        something.
    '''
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

    ''' This will loop pretty much forever. I don't expect us to hit
        many breaking points, except to switch out the API key (since 
        it refreshes every day until we get a permanent key). Not sure 
        if I'm a huge fan of the while True, but oh well.
    '''
    while True:
        accountId = playersToProcess.pop()
        matchList = getAccountMatchList(accountId);       
        
        if matchList:
            for matchId in matchList:
                count += 1
                if str(matchId) not in matches_processed:
                    matches_processed[str(matchId)] = 1
                    matchResponse = getMatch(matchId)
                    
                    ''' If we run into some status error, print out the specific status 
                        code received from the get request. Continue on. Maybe we can add
                        back the 'badLoopsInARow' concept, but I don't think it's too important
                    '''
                    if not matchResponse or (str(matchResponse.statusCode) != str(d.riotAPIStatusCodes.SUCCESS.value)):
                        print('Something went wrong in Whoville')
                        print(matchResponse.statusCode)
                        continue 

                    addPlayersFromMatch(matchResponse.json, players_processed, playersToProcess)

                    new_game = log_match(matchResponse.json)
                    if new_game:
                        new_games += 1

                    if matchResponse.sleepTime > 0:
                        print("We're getting a little too excited here time for sleep")
                        print("Percent new data: " + str(new_games / count))
                        running_data['players_processed'] = players_processed
                        running_data['playersToProcess'] = playersToProcess
                        running_data['matches_processed'] = matches_processed
                        with open("running_data.json", "w") as f:
                            json.dump(running_data, f)
                        time.sleep(matchResponse.sleepTime + 1) #add 1 to be safe :)
                else:
                    print("Already processed game: " + str(matchId))

            players_processed[accountId] = unix_time_millis(datetime.datetime.now())
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
    directory = "../data/matchData/"
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

epoch = datetime.datetime.utcfromtimestamp(0)
def unix_time_millis(dt):
    return (dt - epoch).total_seconds() * 1000.0

def getAccountMatchList(accountId):
    r = d.getMatchesByAccountId(accountId, d.RANKED_SOLO_QUEUE).json()
    if 'matches' in r:
        return [match['gameId'] for match in r['matches']]

def getMatch(matchId):
    r = d.getMatch(matchId)
    return responseObject(r)

class responseObject:
    def  __init__(self, request):
        self.json = request.json()
        self.statusCode = request.status_code
        #Deal With Rate limits
        '''
            rateLimit (rl) and rateLimitCount (rlc) come in as two comma
            delimited lists. rl contains the definition for the rate limits
            and rlc contains the current counts for those. Each comma delimitted
            piece is a colon delimitted piece which contains the seconds in the second
            piece and the limit in the
        '''
        rHeader = request.headers

        try:
            appRateLimitString = rHeader['X-App-Rate-Limit']
            appRateCountString = rHeader['X-App-Rate-Limit-Count']
            methodAppRateLimitString = rHeader['X-Method-Rate-Limit']
            mathodAppRateCountString = rHeader['X-Method-Rate-Limit-Count']
            self.appRateLimits = self.generateRateLimitDict(appRateLimitString)
            self.appRateCounts = self.generateRateLimitDict(appRateCountString)
            self.methodRateLimits = self.generateRateLimitDict(methodAppRateLimitString)
            self.methodRateCounts = self.generateRateLimitDict(mathodAppRateCountString)
            self.sleepTime = self.getSleepTime()

        except:
            print("Exception logged when attempting to create object")
            self.statusCode = 99999;

        return

    def generateRateLimitDict(self, rateLimitString):
        rls = rateLimitString
        rlsArray = rls.split(',')
        rlDict = {}

        for rlTuple in rlsArray:
            rlTupleSplit = rlTuple.split(':')
            rlDict[rlTupleSplit[1]] = rlTupleSplit[0]
        return rlDict

    def getSleepTime(self):
        appSleepTime = 0
        methodSleepTime = 0
        
        #check app limits
        for bucket in self.appRateLimits:
            if (self.appRateLimits[bucket] == self.appRateCounts[bucket]):
                appSleepTime = bucket
                break
        #check method limits
        for bucket in self.methodRateLimits:
            if self.methodRateCounts[bucket] == self.methodRateLimits[bucket]:
                methodSleepTime = bucket
                return int(bucket)

        if int(methodSleepTime) > int(appSleepTime):
            return int(methodSleepTime)

        else:
            return int(appSleepTime)

startPulling(d.princess_caribou_id)
