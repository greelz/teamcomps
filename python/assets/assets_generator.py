import json
import shutil
import requests
import math

# NOTABLY, WE ADD A RANDOM ENTRY AS A PRIME
# THIS IS BECAUSE HISTORICALLY WE HAD ANNIE (KEY == 1) AS THE FIRST PRIME NUMBER, 2
def getPrimesUpToN(num):
    primes = [2, 3, 5, 7, 11]
    for i in range(13, num, 2):
        is_prime = True
        sqrt_i = math.sqrt(i)
        for prime in primes:
            if prime > sqrt_i:
                break
            if i % prime == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(i)

    return ["why are we so dumb"] + primes

primes = getPrimesUpToN(50000)


# Uncomment this block if you want to re-download the assets from Riot. Maybe at each patch we'll want to update the champions dictionary...
'''
json_files = []
json_files.append((requests.get("http://ddragon.leagueoflegends.com/cdn/9.21.1/data/en_US/champion.json").json(), "champions.json"))
json_files.append((requests.get("http://static.developer.riotgames.com/docs/lol/seasons.json").json(), "seasons.json"))
json_files.append((requests.get("http://static.developer.riotgames.com/docs/lol/queues.json").json(), "queues.json"))
json_files.append((requests.get("http://static.developer.riotgames.com/docs/lol/maps.json").json(), "maps.json"))
json_files.append((requests.get("http://static.developer.riotgames.com/docs/lol/gameModes.json").json(), "gameModes.json"))
json_files.append((requests.get("http://static.developer.riotgames.com/docs/lol/gameTypes.json").json(), "gameTypes.json"))
'''

# Add the prime numbers for the champions inline
with open("champions.json", "r") as f:
    champ_dic = json.load(f)

for champion in champ_dic['data']:
    champ_img = requests.get("http://ddragon.leagueoflegends.com/cdn/9.21.1/img/champion/" + champion + ".png", stream=True)
    with open("images/" + champion + ".png", "wb") as f:
        shutil.copyfileobj(champ_img.raw, f)
    champ_dic['data'][champion]['primeKey'] = primes[int(champ_dic['data'][champion]['key'])]

# Uncomment if you want to overrite the existing (correct) champions dictionary
'''
with open("champions.json", "w") as f:
    json.dump(champ_dic, f)
'''

