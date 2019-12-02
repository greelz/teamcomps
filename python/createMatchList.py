import DataPuller as d
import requests 
import json
import os
import sys
import threading
import time
import zipUtilities as zu
from zipfile import ZipFile
from matchPusher import pushMatchesToSiteFromZip
from datetime import datetime

def getAllMatchesForSummoner(summoner_name, season, region, game_ids = {}, players_to_add = 0, player_ids = {}):
    account_id = d.getAccountIdByName(summoner_name, region)
    begin_index = 0
    num_unique_games_for_summoner = 0

    # Grab the first game of the season, then we can find how many games we'll need to officially grab.
    # Note the hard-coded 0, 100 -- just grab the first 100 games
    match_json = d.getMatchesByAccountId(account_id, region, season, d.RANKED_SOLO_QUEUE, 0, 100)

    if 'totalGames' in match_json:
        total_games = match_json['totalGames']
    else:
        print("No games found for this summoner.")
        return

    num_unique_games_for_summoner += save_match_ids(match_json, game_ids, player_ids, players_to_add, region, season)

    while begin_index < total_games:
        begin_index += 100 # Add 100 to begin_index so the next loop keeps going
        # Note, this request assumes that the Riot API doesn't care if we
        # request more than the total number of games. I think that makes sense
        match_json = d.getMatchesByAccountId(account_id, region, season, d.RANKED_SOLO_QUEUE, begin_index, begin_index + 100)
        

        # Consider upping total_games... since this sometimes is weird and increases the more requests we have. Not sure why, I think this is a bug on their side tho
        if 'totalGames' in match_json:
            total_games = match_json['totalGames']

        # Save the unique game_ids
        num_unique_games_for_summoner += save_match_ids(match_json, game_ids, player_ids, players_to_add, region, season)

    # Display how many games we downloaded, compared to how many total games they have
    print(str(num_unique_games_for_summoner) + "/" + str(total_games) + " unique games for " + summoner_name)


def get_games_not_on_db(games_arr):
    # Do a remote query
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    response = requests.post('http://localhost:2021/matches/existence', data = json.dumps(games_arr), headers = headers)
    return response.json()

# Parameters:
#   match_json: list of matches, basically
#   games_dictionary: list of existing matches
#   player_dic: list of players that we want to download games for
#   players_to_add: max numbers of players to queue up to add games for
#   region: 
#   season: 
def save_match_ids(match_json, games_dictionary, player_dic, players_to_add, region, season):
    games_to_download = []
    if 'matches' in match_json:
        for game in match_json['matches']:
            if 'gameId' in game:
                game_id = str(game['gameId'])
                games_to_download.append(game_id)

    print(games_to_download)
    games_to_download = get_games_not_on_db(games_to_download)
    input()

    # games_to_download is a list of unique game ids now
    # Just spawn <n> threads to do the work here, we know it's at most 100
    threads = []
    num_threads = len(games_to_download) 
    players_arr = [[] for i in range(num_threads)]
    time_to_sleep = [0 for i in range(num_threads)]
    need_more_players = len(player_dic) < players_to_add
    for i in range(num_threads):
        games_dictionary[game_id] = ""
        new_thread = threading.Thread(target=thread_function, args=(games_to_download[i], region, season, players_arr, need_more_players, i, time_to_sleep))
        threads.append(new_thread)
        # Don't fire a thread immediately, wait just .1 seconds...
        time.sleep(.05)
        new_thread.start()

    for thread in threads:
        thread.join()

    time_to_sleep.append(0) # Sometimes there were no games downloaded
    sleep_time_seconds = max(time_to_sleep)
    if sleep_time_seconds > 0:
        time1 = time.time()
        directory = "../../matchData/" + season + "/" + region
        print("Zipping, deleting originals, pushing to site.")
        fancy_dir_name = directory + "-" + datetime.now().strftime("%d%m%Y-%H%M%S")
        zu.createZip(directory, fancy_dir_name)
        zu.deleteFilesInFolder(directory)
        pushMatchesToSiteFromZip(fancy_dir_name)
        time2 = time.time()
        time_elapsed = time2 - time1
        if time_elapsed < sleep_time_seconds:
            sleepy_time = sleep_time_seconds - time_elapsed
            print("We finished the parsing, and we still will sleep for " + str(sleepy_time) + " seconds.")
            time.sleep(sleepy_time)
    if need_more_players:
        for group in players_arr:
            group = set(group)
            for summoner_name in group:
                if summoner_name not in player_dic:
                    player_dic[summoner_name] = 0

    return len(games_to_download)




def thread_function(game_id, region, season, players_arr, need_more_players, index, time_to_sleep):
    game_json = d.getMatch(game_id, region)
    if 'sleepTime' in game_json:
        print("Thread knows it should sleep. Return sleep value.")
        time_to_sleep[index] = game_json['sleepTime']
    else:
        write_game_to_file(game_json, game_id, region, season)
        if need_more_players:
            save_player_ids(game_json, players_arr, index)

def save_player_ids(match_json, players_arr, index):
    if match_json and 'participantIdentities' in match_json:
        players = match_json['participantIdentities']
        for player in players:
            player_obj = player['player']
            if 'summonerName' in player_obj:
                summoner_name = player_obj['summonerName']
                players_arr[index].append(summoner_name)

def write_game_to_file(match_json, game_id, region, season):
    filename = game_id + '.json'
    directory = "../../matchData/" + season + "/" + region
    abspath = os.path.join(directory, filename)
    with open(abspath, 'w') as f:
        json.dump(match_json, f)

def build_game_ids(region, season, filename):
    directory = "../../matchData/" + season + "/" + region
    game_ids_dir = "../../matchData/" + season + "/"
    game_ids = {}
    if not os.path.exists(directory):
        os.makedirs(directory)

    if filename:
        print("Loading from " + game_ids_dir + filename)
        if ".zip" in filename:
            with ZipFile(game_ids_dir + filename, 'r') as f:
                for filename in f.namelist():
                    match_id = filename[len(region) + 1:-5]
                    game_ids[match_id] = ""

        else:
            with open(game_ids_dir + filename, "r") as f:
                game_ids = json.load(f)
    print("Now walking " + directory + " to load existing files...")
    for root, dirs, files in os.walk(directory):
        for game_id in files:
            game_ids[game_id[:-5]] = ""

    print("We found " + str(len(game_ids)) + " existing games.")
    return game_ids

if __name__ == "__main__":
    # Possible cmd arguments
    # -n: seed account name, like 'greelz'
    # -f: filename to parse existing game IDs 
    # -r: region to use
    # -s: season to read from
    # -d: directory to parse games from
    # python createMatchList.py -n greelz -f test.xml -r na1 -s season2019
    region = 'na1'
    season = 'SEASON2019'
    filename = ""

    num_args = len(sys.argv)
    for indx, arg in enumerate(sys.argv):
        if indx == num_args - 1:
            break
        if arg == '-n': 
            first_player = sys.argv[indx + 1]
        if arg == '-f': 
            filename = sys.argv[indx + 1]
        if arg == '-r': 
            region = sys.argv[indx + 1]
        if arg == '-s':
            temp_season = sys.argv[indx + 1].upper()
            if temp_season in d._SEASONS:
                season = temp_season

    print("Downloading games for " + first_player + " on " + region + " in " + season + ".")
    print("Building a dictionary of existing games...")
    game_ids = build_game_ids(region, season, filename)
    players_list = { first_player: 1 }
    unique_players_to_add = 5000

    # From the seed account, add <n> more summoners, then loop indefinitely
    getAllMatchesForSummoner(first_player, season, region, game_ids, unique_players_to_add, players_list)

    while True:
        # Find the next summoner to download games from
        if len(players_list) > 0:
            for summoner in players_list:
                if players_list[summoner] == 0:
                    break
            # Need to check if we've looped through the entire list of players
            if players_list[summoner] == 1:
                print("We've looped through all summoners. Complete.")
                exit()
        else:
            print("We've looped through all summoners. Complete.")
            exit()

        print("Downloading games for " + summoner)
        # Now we have a new summoner, find their games and keep going
        players_list[summoner] = 1
        getAllMatchesForSummoner(summoner, season, region, game_ids, unique_players_to_add, players_list)

