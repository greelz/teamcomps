import requests
import json
import pprint
from enum import Enum

#ToDo - All APIs are currently using NA data
API_KEY = "RGAPI-0e41ab0a-d10d-4921-b5d6-93002533bf52"
KEY_HEADER = "X-Riot-Token"
RANKED_SOLO_QUEUE = 420

#Start with Imaqtpie as a seed
ImaqtpieAccountID = 32639237
greelzId = 208054926
princess_caribou_id = 35062645

sRegion = "na1"

class lolTiers(Enum):
    BRONZE = 1
    SILVER = 2
    GOLD = 3
    PLATINUM = 4
    MASTER = 5
    CHALLENGER = 6

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

playersSearched=[]

matcheesSearched=[]




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



def getMatchesByAccountId(accountID, queue = ""):
    #TODO Support query parameters
    header = {KEY_HEADER: API_KEY}

    
    sUrl = "https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/" + str(accountID)
    if queue != "":
        sUrl += "?queue=" + str(queue)

    r = requests.get(sUrl, headers = header)
    return r

def getMatch(matchId):
    header = {KEY_HEADER: API_KEY}
    sUrl= "https://na1.api.riotgames.com/lol/match/v3/matches/" + str(matchId)

    r = requests.get(sUrl, headers = header)
    return r


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
'''
    riotAPIHandler is intended to be the driver for pulling in data via the Riot APIs
    (https://developer.riotgames.com/api-methods/). Until I figure out the data base we are going
    to be straight up saving the JSON files dawg. I will be using a separate class to manipulate the data
    stored in the JSON files. TODO: Have the file interaction class write to a data base (Mongo?)
'''

class RiotAPIHandler:
    def __init__(self, apiKey, region='na1'):
        self.key = apiKey
        self.region = region

    def __str__(self):
        return ("Region: " + self.region +"\nKey: " + self.key)


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
