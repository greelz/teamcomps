import json
import shutil
import requests
import math
import assets_generator as ag
from role_generator import getChampionRoles as gc

# Stuff that doesn't change, but FYI
'''
json_files = []
json_files.append((requests.get("http://static.developer.riotgames.com/docs/lol/seasons.json").json(), "seasons.json"))
json_files.append((requests.get("http://static.developer.riotgames.com/docs/lol/queues.json").json(), "queues.json"))
json_files.append((requests.get("http://static.developer.riotgames.com/docs/lol/maps.json").json(), "maps.json"))
json_files.append((requests.get("http://static.developer.riotgames.com/docs/lol/gameModes.json").json(), "gameModes.json"))
json_files.append((requests.get("http://static.developer.riotgames.com/docs/lol/gameTypes.json").json(), "gameTypes.json"))
'''

def generateChampionJsonAndImages(patch = ""):
	patch = '9.23.1'
	champion_json = requests.get("http://ddragon.leagueoflegends.com/cdn/" + patch + "/data/en_US/champion.json").json();


	for champion in champion_json['data']:
		champ_img = requests.get("http://ddragon.leagueoflegends.com/cdn/" + patch + "/img/champion/" + champion + ".png", stream=True)
		with open("../../website/images/champions/" + champion + ".png", "wb") as f:
			shutil.copyfileobj(champ_img.raw, f)

	with open("champions.json", "w") as f:
		json.dump(champion_json, f)
	
	return champion_json

def generateJavascriptFile(champions):
	# Generate a nicer .json file that allows quick lookups in JS
	# We'll create a dictionary like this:
	# { name: { "Aatrox": { "key": riot key, , ... },
	# id:   { "

	champ_roles = gc()
	champions = champions['data']
	js_dic = { 'dataKeyFromRiotKey': {}, 'dataKeyFromHumanName': {}, 'data': {} }
	for champion in champions:
		champ_data = champions[champion]
		# champion is the encoded name
		# champions[champion]['name'] 
		# champions[champion]['key'] is the riot key
		js_dic['data'][champion] = { 
			'name': champ_data['name'],
			'key': champ_data['key'],
			'roles': champ_roles[champ_data['name']]
		}
		js_dic['dataKeyFromRiotKey'][champ_data['key']] = champion
		js_dic['dataKeyFromHumanName'][champ_data['name']] = champion

	with open("jschamp_data.json", "w") as f:
		json.dump(js_dic, f)

if __name__ == "__main__":
	champ_dic = generateChampionJsonAndImages('9.23.1')
	generateJavascriptFile(champ_dic)
