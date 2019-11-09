import DataPuller as d
import json
import os
import sys
import threading
import time

def getAllMatchesForSummoner(summoner_name, season, region, game_ids = {}, players_to_add = 0, player_ids = {}):
    account_id = d.getAccountIdByName(summoner_name, region)
    begin_index = 0
    num_unique_games_for_summoner = 0

    # Grab the first game of the season, then we can find how many games we'll need to officially grab.
    match_json = d.getMatchesByAccountId(account_id, region, season, d.RANKED_SOLO_QUEUE, 0, 100)

    if 'totalGames' in match_json:
        total_games = match_json['totalGames']
    else:
        print("No games found for this summoner.")
        return

    num_unique_games_for_summoner += save_match_ids(match_json, game_ids, player_ids, players_to_add, region)
    begin_index += 100

    while begin_index < total_games:
        # Note, this request assumes that the Riot API doesn't care if we
        # request more than the total number of games. I think that makes sense
        match_json = d.getMatchesByAccountId(account_id, region, season, d.RANKED_SOLO_QUEUE, begin_index, begin_index + 100)
        
        begin_index += 100 # Add 100 to begin_index so the next loop keeps going

        # Consider upping total_games... since this sometimes is weird and increases the more requests we have. Not sure why. 
        if 'totalGames' in match_json:
            total_games = match_json['totalGames']

        # Save the unique game_ids
        num_unique_games_for_summoner += save_match_ids(match_json, game_ids, player_ids, players_to_add, region)

    print(str(num_unique_games_for_summoner) + "/" + str(total_games) + " unique games for " + summoner_name)

def save_match_ids(match_json, games_dictionary, player_dic, players_to_add, region):
    games_to_download = []
    if 'matches' in match_json:
        for game in match_json['matches']:
            if 'gameId' in game:
                game_id = str(game['gameId'])
                if game_id not in games_dictionary:
                    games_to_download.append(game_id)

    # games_to_download is a list of unique game ids now
    # Just spawn <n> threads to do the work here
    threads = []
    num_threads = len(games_to_download) # We know this won't be larger than 100
    players_arr = [[] for i in range(num_threads)]
    time_to_sleep = [0 for i in range(num_threads)]
    time_to_sleep.append(0)
    need_more_players = len(player_dic) < 1000
    for i in range(num_threads):
        games_dictionary[game_id] = ""
        new_thread = threading.Thread(target=thread_function, args=(games_to_download[i], region, players_arr, need_more_players, i, time_to_sleep))
        threads.append(new_thread)
        # Don't fire a thread immediately, wait just .1 seconds...
        time.sleep(.05)
        new_thread.start()

    for idx, thread in enumerate(threads):
        thread.join()

    sleep_time_seconds = max(time_to_sleep)
    if sleep_time_seconds > 0:
        print("Heading to bed for " + str(sleep_time_seconds))
        time.sleep(sleep_time_seconds)
    if need_more_players:
        for group in players_arr:
            group = set(group)
            for summoner_name in group:
                if summoner_name not in player_dic:
                    player_dic[summoner_name] = 0

    return len(games_to_download)

def thread_function(game_id, region, player_arr, need_more_players, index, time_to_sleep):
    game_json = d.getMatch(game_id, region)
    if 'sleepTime' in game_json:
        print("Thread knows it should sleep. Return sleep value.")
        time_to_sleep[index] = game_json['sleepTime']
    else:
        write_game_to_file(game_json, game_id, region)
        if need_more_players:
            save_player_ids(game_json, player_arr, index)

def save_player_ids(match_json, player_arr, index):
    if match_json and 'participantIdentities' in match_json:
        players = match_json['participantIdentities']
        for player in players:
            player_obj = player['player']
            if 'summonerName' in player_obj:
                summoner_name = player_obj['summonerName']
                player_arr[index].append(summoner_name)

def write_game_to_file(match_json, game_id, region):
    filename = game_id + '.json'
    directory = "../../matchData/" + region
    abspath = os.path.join(directory, filename)
    with open(abspath, 'w') as f:
        json.dump(match_json, f)

def build_game_ids(region, filename):
    directory = "../../matchData/" + region
    game_ids = {}
    if not os.path.exists(directory):
        os.makedirs(directory)

    if filename:
        print("Loading from ../../matchData/" + filename)
        with open("../../matchData/" + filename, "r") as f:
            game_ids = json.load(f)
    print("Now walking " + directory + " to load existing files...")
    for root, dirs, files in os.walk(directory):
        for game_id in files:
            game_ids[game_id[:-5]] = ""

    print("We found " + str(len(game_ids)) + " existing games.")
    return game_ids

if __name__ == "__main__":
    filename = ""
    args = sys.argv
    if len(args) == 3:
        first_player = args[1]
        region = args[2]
    elif len(args) == 4:
        first_player = args[1]
        region = args[2]
        filename = args[3]
    else:
        region = "euw1"
        first_player = "Tam"

    print("Building a dictionary of existing games...")
    game_ids = build_game_ids(region, filename)
    players_list = { first_player: 1 }
    unique_players_to_add = 1000

    # From the seed account, add <n> more summoners, then loop indefinitely
    print("Downloading games from " + first_player + " on " + region)
    getAllMatchesForSummoner(first_player, d._SEASONS['SEASON2019'], region, game_ids, unique_players_to_add, players_list)

    while True:
        # Find the next summoner to download games from
        if len(players_list) > 0:
            for summoner in players_list:
                if players_list[summoner] == 0:
                    break
            # Need to check if we've looped through the entire list of players
            if players_list[summoner] == 1:
                print("We've looped through all summoners. Complete.")
        else:
            print("We've looped through all summoners. Complete.")
            break

        print("Downloading games for " + summoner)
        # Now we have a new summoner, find their games and keep going
        players_list[summoner] = 1
        getAllMatchesForSummoner(summoner, d._SEASONS['SEASON2019'], region, game_ids, unique_players_to_add, players_list)
