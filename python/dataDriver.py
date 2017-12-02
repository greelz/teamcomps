import dataPuller as d
import time
import os
import json
import importlib
#driver function



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
    waitTimes={}
    matches=[]
    playersToSearchFor = []
    playersProcessed = []

    playersToProcess = []
    playersToProcess.append(seedAccountId)
    count = 0
    dumpDir = initializeRunConditions()
    test = 3
    while True:
        accountId = playersToProcess.pop()
        matchList = getAccountMatchList(accountId);       
        
        for matchId in matchList:
            print('Processing match: '+str(matchId))
            count += 1
            if count > 100000:
                return
                
            matchResponse = getMatch(matchId)

            
            if str(matchResponse.statusCode) != str(d.riotAPIStatusCodes.SUCCESS.value):
                print('Something went wrong in Whoville')
                print(matchResponse.statusCode)
                print(d.riotAPIStatusCodes.SUCCESS)
                badLoopsInARow += 1
                continue 

            addPlayersFromMatch(matchResponse.json,playersProcessed,playersToProcess)
            writeMatchToFile(matchResponse.json,dumpDir)
            if matchResponse.sleepTime > 0:
                print("We're getting a little to excited here time for sleep")
                time.sleep(matchResponse.sleepTime+1) #add 1 to be safe :)
            #determine if we should sleep

        playersProcessed.append(accountId)
        badLoopsInARow = 0
    return "lolRulez"

def initializeRunConditions():
    #Create the matchdirectory if necessary
    
    dumpDir = 'DataDumps\\MatchData\\'
    dumpDir = os.path.join(os.getcwd(),dumpDir)
    if not os.path.exists(dumpDir):
        print("creating dump directory")
        os.makedirs(dumpDir)
    
    return dumpDir
    

def addPlayersFromMatch(match,playersProcessed,playersToProcess):
    for pId in match['participantIdentities']:
        player=pId['player']
        accountId=player['accountId']
        # Do not add players we have already processed or are waiting to process
        if (accountId in playersProcessed) or (accountId in playersToProcess):
            continue
        playersToProcess.append(accountId)

def writeMatchToFile(match,directory):
    matchId = match['gameId']
    file = str(matchId) + '.json'
    with open(os.path.join(directory,file),'w') as f:
        json.dump(match,f)
        print(os.path.abspath(file))
    
        
def writePlayersToFile(match):
    print("Test code")

def getAccountMatchList(accountId):
    r = d.getMatchesByAccountId(accountId);
    
    requestJSON = r.json()
    matchList = []
    
    for match in requestJSON['matches']:
        
        matchList.append(match['gameId']);  

    return matchList

def getMatch(matchId):
    r = d.getMatch(matchId)
    return responseObject(r)
    #,r.status_code,r.headers['X-App-Rate-Limit'],r.headers['X-App-Rate-Limit-Count'])

def test():
    arr=[1,2,3]
    count = 0
    for a in arr:
        count += 1
        if (count>10):
            print("asdf")
            break;
        print(a)
        arr.append(count)

def generateRateLimitDict(rateLimitString):
    rls = rateLimitString
    rlsArray = rls.split(',')
    rlDict = {}

    for rlTuple in rlsArray:
        rlTupleSplit = rlTuple.split(':')
        rlDict[rlTupleSplit[1]]=rlTupleSplit[0]

    return rlDict


class responseObject:
    def  __init__(self, request):
        self.json = request.json()
        self.statusCode = request.status_code
        #Deal With Rate limits
        '''
            rateLimit (rl) and rateLimitCount (rlc) come in as two comma
            delimitted lists. rl contains the definition for the rate limits
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
            self.appRateLimits = generateRateLimitDict(appRateLimitString)
            self.appRateCounts = generateRateLimitDict(appRateCountString)
            self.methodRateLimits = generateRateLimitDict(methodAppRateLimitString)
            self.methodRateCounts = generateRateLimitDict(mathodAppRateCountString)

        except:
            print("Exception logged when attempting to create object")
            self.statusCode = 99999;
        self.sleepTime = self.getSleepTime()

        return

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

startPulling(d.greelzId)
