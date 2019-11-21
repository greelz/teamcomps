import json

# This file takes match data from a riot game, parses it, and returns 
# relevant information for teamcomps.org. Generally, that's who won,
# the patch, region, duration of game, and champions involved.

def getChampionDictionary():
    champs = {}
    with open("assets/jschamp_data.json", "r") as f:
        champs = json.load(f)
    return champs

def process_match(match_data):
    champion_dictionary = getChampionDictionary()
    team_dict = getWinnersAndLosers(match_data)
    if not team_dict:
        return

    events_to_return = []
    if "losers" and "winners" in team_dict:
        events_to_return.append(build_team_event_row(team_dict['losers'], False, match_data['gameId'], match_data['gameVersion'], str(match_data['platformId']), match_data['gameDuration'], champion_dictionary))
        events_to_return.append(build_team_event_row(team_dict['winners'], True, match_data['gameId'], match_data['gameVersion'], str(match_data['platformId']), match_data['gameDuration'], champion_dictionary))

    if len(events_to_return) == 2:
        return events_to_return
    else:
        return None

def build_team_event_row(champArr, isWin, matchId, patch, region, duration, champion_dictionary):
    champions = [champion_dictionary['dataKeyFromRiotKey'][str(key)] for key in champArr]
    team_event_row = {
    'ChampOne': champions[0],
    'ChampTwo': champions[1],
    'ChampThree': champions[2],
    'ChampFour': champions[3],
    'ChampFive': champions[4],
    'IsWin': isWin,
    'MatchId': matchId,
    'Patch': patch,
    'Region': region,
    'Duration': duration
    }

    return team_event_row

def getWinnersAndLosers(matchDict):
    teamDict = {}
    winningChamps = []
    losingChamps = []
    winningTeamId = ""
    losingTeamId = ""

    if not "teams" in matchDict:
        return

    for team in matchDict["teams"]:
        if "win" in team:
            if team["win"]=="Win":
                winningTeamId = team["teamId"]
            elif team["win"] == "Fail":
                losingTeamId = team["teamId"]

    if winningTeamId == "" or losingTeamId == "":
        return ""

    # now find each participant that was on the winning team
    for participant in matchDict["participants"]:
        if participant["teamId"] == winningTeamId:
            winningChamps.append(participant["championId"])
        elif participant["teamId"] == losingTeamId:
            losingChamps.append(participant["championId"])

    teamDict["losers"]  = losingChamps
    teamDict["winners"] = winningChamps

    return teamDict
