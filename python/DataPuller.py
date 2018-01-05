import requests
import datetime
import json
import pprint
import time
from enum import Enum

#ToDo - All APIs are currently using NA data
current_key_index = 0
API_KEYS = ["RGAPI-64fea9df-baab-41e4-a04b-70277334eb2e", "RGAPI-6605aa29-d46a-4f6a-bff6-0a207d6864ab", "RGAPI-485ceff6-4ed7-42ca-981f-311dc73b0f52"]
sleep_until_times = [0 for key in API_KEYS]
KEY_HEADER = "X-Riot-Token"
RANKED_SOLO_QUEUE = 420

class riotAPIStatusCodes(Enum):
    SUCCESS = 200
    BADREQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    DATANOTFOUND = 404
    METHODNOTALLOWED = 405
    UNSUPPORTEDMEDIATYPE = 415
    RATELIMITEXCEEDED = 429
    INTERNALSERVERERROR = 500
    BADGATEWAY = 502
    SERVICEUNAVAILABLE = 503
    GATEWAYTIMEOUT = 504

def getParticipantsAboveTier():
    #TODO implement later to restrict people we search over
    return ""


def getWinningChamps(matchDict):
    #Get id of winning team first
    winningTeamId = ""
    winningChamps=[]
    for team in matchDict['teams']:
        if team['win']=="Win":
            winningTeamId = team['teamId']
    if winningTeamId == "":
        return ""

    #now find each participant that was on the winning team
    for participant in matchDict['participants']:
        if participant['teamId']!=winningTeamId:
            continue
        winningChamps.append(participant['championId'])
    return winningChamps

def getAllMatchWinningChamps(matchListJSON,f="winners.txt"):
    winnerDict = {}
    with open(f,'a') as the_file:

        for match in matchListJSON:
            winningChamps = getWinningChamps(match)
            matchId = match['gameId']
            matchString = str(matchId) + ":" + str(winningChamps)
            the_file.write(matchString + "\n")

    return

def writeMatchesToFile(matchListJSON):
    prefix = 'SampleData\\MatchDumps\\'
    for match in matchListJSON:
        matchId = match['gameId']
        file = prefix+str(matchId)+'.json'
        with open(file,'w') as fh:
            json.dump(match,fh)

def getAllSampleData(dump="allWinners.txt"):
    sampleFiles=["matches1.json","matches2.json","matches3.json","matches4.json","matches5.json","matches6.json"]

    for f in sampleFiles:
        fullFile="sampleData\\"+fs
        data = json.load(open(fullFile),encoding='latin=1')
        getAllMatchWinningChamps(data['matches'],dump)
    return

def writeAllSampleMatchesToFile():
    sampleFile = 'sampleData\\matches1.json'
    data = json.load(open(sampleFile),encoding='latin=1')
    writeMatchesToFile(data['matches'])

def getMatchesByAccountId(accountID, region, callback, queue = ""):
    url = "https://" + region + ".api.riotgames.com/lol/match/v3/matchlists/by-account/" + str(accountID)
    if queue != "":
        url += "?queue=" + str(queue)
    print(url)
    return requestWrapper(url, callback)

def getMatch(matchId, region, callback):
    url = "https://" + region + ".api.riotgames.com/lol/match/v3/matches/" + str(matchId)
    return requestWrapper(url, callback)

def requestWrapper(url, callback, headers = {}):
    ''' Algorithm: 
        1. Get the request using the current API_KEY
        2. If we need to sleep, then process then match and flip API_KEYS (for the next request)
        3. If we're at the last API_KEY, then we head back to the start and sleep for the remaining time from step #2, and etc
    '''

    global current_key_index
    headers[KEY_HEADER] = API_KEYS[current_key_index]
    r = responseObject(requests.get(url, headers = headers))

    # First check if something went wrong (I'm not sure if this has ever really
    # been hit). 
    if not r or (str(r.statusCode) != str(riotAPIStatusCodes.SUCCESS.value)):
        print('Something went wrong in Whoville')
        print(r.statusCode)
        return None

    if r.sleepTime > 0:
        print("Hit our limit on api_key #" + str(current_key_index))
        if callback:
            callback()
        current_time = unix_time_millis(datetime.datetime.now())
        sleep_until_times[current_key_index] = current_time + (r.sleepTime * 1000.0)
        current_key_index += 1
        if current_key_index >= len(API_KEYS):
            print("Resetting key index to 0.")
            current_key_index = 0

        if current_time < sleep_until_times[current_key_index]:
            seconds_to_sleep = int((sleep_until_times[current_key_index] - current_time) / 1000.0) + 1 #add 1 to be safe :)
            print("We're getting a little too excited here time for sleep.")
            print("Sleeping for " + str(seconds_to_sleep) + " seconds. Bye now!")
            time.sleep(seconds_to_sleep) 
        else:
            sleep_until_times[current_key_index] = 0

    return r
    
epoch = datetime.datetime.utcfromtimestamp(0)
def unix_time_millis(dt):
    return (dt - epoch).total_seconds() * 1000.0

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




'''
Below code is not implemented yet - Matt needs to stop searching for stuff below here
*************************************************************************************
*************************************************************************************
*************************************************************************************
*************************************************************************************
*************************************************************************************
*************************************************************************************
*************************************************************************************
*************************************************************************************
'''

def loadJSONMatch(matchDict):
    gameDuration = matchDict['gameDuration']
    seasonId = matchDict['seasonId']
    queueId = matchDict['queueId']
    gameId = matchDict['gameId']
    participantIdentities = matchDict['participantIdentities']
    gameVersion = matchDict['gameVersion']
    mapId = matchDict['mapId']
    gameType = matchDict['gameType']
    teams = matchDict['teams']
    participants = matchDict['participants']
    gameMode = matchDict['gameMode']
    gameCreation = matchDict['gameCreation']

    return LoLMatch(seasonId, queueId, gameId, participantIdentities, gameVersion, gameMode, mapId, gameType, teams, participants, gameDuration, gameCreation)

def appendNewProperty(name, value, propString):
    name = str(name)
    value = str(value)
    propString += (name + ": " + value)
    propString += "\n"
    return propString

class RiotJSONHandler:
    def __init__(self, apiKey, region='na1'):
        self.key = apiKey
        self.region = region

class lolTiers(Enum):
    BRONZE = 1
    SILVER = 2
    GOLD = 3
    PLATINUM = 4
    MASTER = 5
    CHALLENGER = 6

class LoLMatch():
    def __init__(self, seasonId, queueId, gameId, participantIdentities, gameVersion, gameMode, mapId, gameType, teams, participants, gameDuration, gameCreation):
        self.seasonId = seasonId
        self.queueId = queueId
        self.gameId = gameId
        self.participantIdentities = participantIdentities
        self.gameVersion = gameVersion
        self.mapId = mapId
        self.gameType = gameType
        self.teams = teams
        self.participants = participants
        self.gameDuration = gameDuration
        self.gameCreation = gameCreation

    def __str__(self):
        matchString = ""
        matchString = appendNewProperty("seasonId",self.seasonId,matchString)
        matchString = appendNewProperty("queueId",self.queueId,matchString)
        matchString = appendNewProperty("gameId",self.gameId,matchString)
        #matchString = appendNewProperty("participantIdentities",self.participantIdentities,matchString)
        matchString = appendNewProperty("gameVersion",self.gameVersion,matchString)
        matchString = appendNewProperty("mapId",self.mapId,matchString)
        matchString = appendNewProperty("gameType",self.gameType,matchString)
        #matchString = appendNewProperty("teams",self.teams,matchString)
        #matchString = appendNewProperty("participants",self.participants,matchString)
        matchString = appendNewProperty("gameDuration",self.gameDuration,matchString)
        matchString = appendNewProperty("gameCreation",self.gameCreation,matchString)
        return matchString

    '''
        A lol match has:
            seasonId (int)
            queueId (int)
            gameId (long)
            participantIdentities (list of ParticipantIdentity objects)
            gameVersion (string)
            gameMode (string)
            mapId (int)
            gameType (string)
            teams (list of TeamStats objects)
            participants (list of ParticipantObjects) Not sure what the difference between a player and a participant is
            gameDuration (long)
            gameCreation (long)
    '''

class ParticipantIdentity:
    '''
        A participant is made up of:
            player (instance of Player object)
            participantId (int)
    '''

class Player:
    '''
        A Player is made up of:
            currentPlatformId (string)
            summonerName (string)
            matchHistoryUri (string)
            platformId (string)
            profileIcon (int)
            summonerId (long)
            accountId (long)
    '''

class TeamStats:
    '''
        TeamStats consists of:
            firstDragon (boolean)
            firstInhibitor (boolean)
            bans (list of ChampBan object)
            baronKills (int)
            firstRiftHerald (boolean)
            firstBaron (boolean)
            riftHeraldKills (int)
            firstBlood (boolean)
            teamId (int)
            firstTower (boolean)
            vilemawKills (int) Wtf is this????
            inhibitorKills (int)
            towerKills (int)
            dominionVictoryScore (int)
            win (string)
            dragonKills (int)
    '''

class ChampBan:
    #Note that this class is referred to as TeamBans in Riot API lingo. I think ChampBan is a clearer name
    '''
        A ChampBan consists of:
            pickTurn (int)
            championId (int)
    '''
class Participant:
    '''
        A Participant consists of:
            stats (Instance of a Stats object)
            participantId (int)
            runes (List of Rune objects)
            timeline (participantTimelineObject)
            teamId (int)
            spell2Id (int)
            mastery (list of mastery objects)
            highestAchievedSeasonTier (string)
            spell1Id (int)
            championId (int)
    '''
class Stats:
    '''
        A Stats object consists of:
            #TODO Break up into subclasses for organization
            physicalDamageDealt (long)
            neutralMinionsKilledTeamJungle (int)
            magicDamageDealt (long)
            totalPlayerScore (int)
            win (boolean)
            neutralMinionsKilledEnemyJungle (int)
            altarsCaptured (int)
            largestCriticalStrike (int)
            totalDamageDealt (long)
            magicDamageDealtToChampions(long)
            visionWardsBoughtInGame (int)
            damageDealtToObjectives (long)
            items (array of all items held by champ. In riot these are individually [item0, item6]
            teamObjective (int)
            totalTimeCrowdControlDealt (int)
            longestTimeSpentLiving (int)
            wardsKilled (int)
            firstTowerAssist (boolean)
            firstTowerKill (boolean)
            visionScore (long)
            wardsPlaced (int)
            turretKills (int)
            damageSelfMitigated (long)
            champLevel (int)
            nodeNeutralizeAssist (int)
            firstInhibitorKill (boolean)
            goldEarned (int)
            magicalDamageTaken (long)
            nodeCaptureAssist (int)
            trueDamageTaken (long)
            nodeNeutralize (int)
            firstInhibitorAssist (boolean)
            neutralMinionsKilled (int)
            objectivePlayerScore (int)
            combatPlayerScore (int)
            damageDealtToTurrets (long)
            altarsNeutralized (int)
            physicalDamageDealtToChampions (long)
            goldSpent (int)
            trueDamageDealt (long)
            trueDamageDealtToChampions (long)
            participantId (int)
            totalHeal (long)
            totalMinionsKilled (int)
            nodeCapture (int)
            sightWardsBoughtInGame (int)
            totalDamageDealtToChampions (long)
            totalUnitsHealed (int)
            inhibitorKills (int)
            totalScoreRank (int)
            totalDamageTaken (long)
            timeCCingOthers (long)
            physicalDamageTaken (long)
    '''

class KDAStats:
    '''
        A KDAStats object consists of:
            deaths (int)
            killingSprees (int)
            firstBloodKill (boolean)
            assists (int)
            kills (int)
            doubleKills (int)
            tripleKills (int)
            quadraKills (int)
            pentaKills (int)
            largestMultiKill (int)
            unrealKills (int)
            largestKillingSpree (int)
            firstBloodAssist (boolean)

        This collection of items is meant to track a players stats associated
        with kills/assists/deaths [kills and assists are only tracked here for champ kills]
    '''

class DamageStats:
    'asdf'
class Rune:
    '''
        A Rune object consists of:
            runeId (int)
            rank (int)
    '''

class ParticipantTimeline:
    '''
        A ParticipantTimeline object consists of:
            lane (string)
            participantId (int)
            csDiffPerMinDeltas (Map[string, double])
            goldPerMinDeltas (Map[string, double])
            xpDiffPerMinDeltas (Map[string, double])
            creepsPerMinDeltas (Map[string, double])
            xpPerMinDeltas (Map[string, double])
            role (string)
            damageTakenDiffPerMinDeltas (Map[string, double])
            damageTakenPerMinDeltas (Map[string, double])
    '''

class Mastery:
    '''
        A Mastery object consists of:
            masteryId (int)
            rank (int)
    '''
