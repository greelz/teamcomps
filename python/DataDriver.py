import DataPuller as d
import DBDriver as db
import time
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

    badLoopsInARow = 0
    waitTimes = {}
    matches = {}
    running_data = {}

    playersProcessed = {}
    playersToProcess = []
    playersToProcess.append(seedAccountId)
    count = 0
    test = 3
    while True:
        accountId = playersToProcess.pop()
        matchList = getAccountMatchList(accountId);       
        
        for matchId in matchList:
            count += 1
            if count % 277 == 0:
                print("Doing great. Processing match " + str(matchId))
            matchResponse = getMatch(matchId)
            
            if str(matchResponse.statusCode) != str(d.riotAPIStatusCodes.SUCCESS):
                print('Something went wrong in Whoville')
                print(matchResponse.statusCode)
                print(d.riotAPIStatusCodes.SUCCESS)
                badLoopsInARow += 1
                continue 

            addPlayersFromMatch(matchResponse.json, playersProcessed, playersToProcess)
            running_data['playersProcessed'] = playersProcessed
            running_data['playersToProcess'] = playersToProcess
            with open("running_data.json", "w") as f:
                json.dump(running_data, f)
            log_match(matchResponse.json)
            if matchResponse.sleepTime > 0:
                print("We're getting a little to excited here time for sleep")
                time.sleep(matchResponse.sleepTime+1) #add 1 to be safe :)
            #determine if we should sleep

        playersProcessed[accountId] = 1
        badLoopsInARow = 0

def addPlayersFromMatch(match, playersProcessed, playersToProcess):
    for pId in match['participantIdentities']:
        player = pId['player']
        accountId = player['accountId']
        # Do not add players we have already processed or are waiting to process
        if (accountId in playersProcessed) or (accountId in playersToProcess):
            continue
        else:
            playersToProcess.append(accountId)


def writeMatchToFile(match):
    matchId = match['gameId']
    filename = str(matchId) + '.json'
    directory = "../data/matchData/"
    abspath = os.path.join(directory, filename)
    if not os.path.isfile(abspath):
        with open(abspath, 'w') as f:
            json.dump(match, f)
            print("Creating file: " + abspath)
    

def log_match(match): 
    writeMatchToFile(match)
    # And also add this to the database
    # Stop adding the matches to the dictionary, it doesn't really matter anyways
    #db.process_match(match)


def getAccountMatchList(accountId):
    r = d.getMatchesByAccountId(accountId, d.RANKED_SOLO_QUEUE).json()
    if 'matches' in r:
        return [match['gameId'] for match in r['matches']]

def getMatch(matchId):
    r = d.getMatch(matchId)
    return responseObject(r)
    #,r.status_code,r.headers['X-App-Rate-Limit'],r.headers['X-App-Rate-Limit-Count'])


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

        except:
            print("Exception logged when attempting to create object")
            self.statusCode = 99999;

        self.sleepTime = self.getSleepTime()
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
