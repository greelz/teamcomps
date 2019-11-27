import requests

API_KEY = "RGAPI-1b563ac1-206e-4c71-8202-3ff527dd6894"
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
    if season in _SEASONS:
        season = _SEASONS[season]
    else:
        return {}
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
        1. Request whatever url we're looking for
        2. Check if the response is fine. If not, we should sleep
        3. Return the json response, or {} (consumers will always get a dictionary)
    '''
    headers[KEY_HEADER] = API_KEY
    r = responseObject(requests.get(url, headers = headers))

    if r:
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
    
class responseObject:
    def  __init__(self, request):
        self.json = request.json()
        self.statusCode = request.status_code
        rHeader = request.headers

        if self.statusCode == 429:
            # Right now, let's just sleep for 10 mins...
            # The retry-after seems buggy, and waiting for 10 mins is fine. That's the max
            # limit from the website. We're being nice here.
            self.sleepTime = 600
        else:
            self.sleepTime = 0
        return

