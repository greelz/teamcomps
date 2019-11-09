import requests
import datetime
import json
import time
from enum import Enum

current_key_index = 0
API_KEYS = ["RGAPI-1b563ac1-206e-4c71-8202-3ff527dd6894"]
sleep_until_times = [0 for key in API_KEYS]
KEY_HEADER = "X-Riot-Token"
RANKED_SOLO_QUEUE = "420"

_SEASONS = {
    "PRESEASON3": "0",
    "SEASON3": "1",
    "PRESEASON2014": "2",
    "SEASON2014": "3",
    "PRESEASON2015": "4",
    "SEASON2015": "5",
    "PRESEASON2016": "6",
    "SEASON2016": "7",
    "PRESEASON2017": "8",
    "SEASON2017": "9",
    "PRESEASON2018": "10",
    "SEASON2018": "11",
    "PRESEASON2019": "12",
    "SEASON2019": "13"
}

# The only required parameters are accountId and region
def getMatchesByAccountId(accountID, region, season, queue = "", beginIndex = "", endIndex = ""):
# queue, beginIndex, endIndex, beginTime, endTime, championId
    url = "https://" + region + ".api.riotgames.com/lol/match/v4/matchlists/by-account/" + str(accountID) + "?"
    url += "queue=" + queue + "&"
    url += "beginIndex=" + str(beginIndex) + "&"
    url += "endIndex=" + str(endIndex) + "&"
    url += "season=" + season
    return requestWrapper(url)

def getMatch(matchId, region = "na1"):
    url = "https://" + region + ".api.riotgames.com/lol/match/v4/matches/" + str(matchId)
    return requestWrapper(url)

def getAccountIdByName(name, region = "na1"):
    url = "https://" + region + ".api.riotgames.com/lol/summoner/v4/summoners/by-name/" + str(name)
    res = requestWrapper(url)
    if 'accountId' not in res:
        print("Couldn't find summoner.")
        return None
    else:
        return res["accountId"]

def getAccountNameById(playerId, region = "na1"):
    url = "https://" + region + ".api.riotgames.com/lol/summoner/v4/summoners/by-account/" + str(playerId)
    res = requestWrapper(url)
    if 'name' in res:
        return res["name"]
    return None

def getLeague(league, region):
    if league != "challenger" and league != "grandmaster":
        return None
    url = "https://" + region + ".api.riotgames.com/lol/league/v4/" + league + "leagues/by-queue/RANKED_SOLO_5x5"
    return requestWrapper(url)

def requestWrapper(url, headers = {}):
    ''' Algorithm: 
        1. Get the request using the current API_KEY
        2. If we need to sleep, then process then match and flip API_KEYS (for the next request)
        3. If we're at the last API_KEY, then we head back to the start and sleep for the remaining time from step #2, and etc
    '''

    global current_key_index
    headers[KEY_HEADER] = API_KEYS[current_key_index]
    r = responseObject(requests.get(url, headers = headers))

    if r:
        # First check if something went wrong (I'm not sure if this has ever really
        # been hit). 
        if r.statusCode != 200:
            print('Something went wrong in Whoville, status code ' + str(r.statusCode))
            if r.sleepTime > 0:
                print("Returning the time to sleep: " + str(r.sleepTime))
                return { 'sleepTime': r.sleepTime }
            else:
                return r.json

        else:
            return r.json
    return {}
    
epoch = datetime.datetime.utcfromtimestamp(0)
def unix_time_millis(dt = None):
    if not dt:
        dt = datetime.datetime.now()
    return (dt - epoch).total_seconds() * 1000.0

class responseObject:
    def  __init__(self, request):
        self.json = request.json()
        self.statusCode = request.status_code
        '''
            rateLimit (rl) and rateLimitCount (rlc) come in as two comma
            delimited lists. rl contains the definition for the rate limits
            and rlc contains the current counts for those. Each comma delimitted
            piece is a colon delimitted piece which contains the seconds in the second
            piece and the limit in the
        '''
        rHeader = request.headers

        if self.statusCode == 429:
            # Right now, let's just sleep for 10 mins...
            # The retry-after seems buggy...
            self.sleepTime = 600
        else:
            self.sleepTime = 0
        return

