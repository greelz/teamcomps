import json
from role_generator import getChampionRoles as gc

# Generate a nicer .json file that allows quick lookups in JS
# We'll create a dictionary like this:
# { name: { "Aatrox": { "key": riot key, , ... },
# id:   { "

champions = {}
with open("champions.json") as f:
    champions = json.load(f)


champ_roles = gc()
champions = champions['data']
js_dic = { 'dataKeyFromRiotKey': {}, 'dataKeyFromPrimeKey': {}, 'dataKeyFromHumanName': {}, 'data': {} }
for champion in champions:
    champ_data = champions[champion]
    # champion is the encoded name
    # champions[champion]['name'] 
    # champions[champion]['key'] is the riot key
    # champions[champion]['primeKey'] is our prime key
    js_dic['data'][champion] = { 
        'name': champ_data['name'],
        'key': champ_data['key'],
        'primeKey': champ_data['primeKey'],
        'roles': champ_roles[champ_data['name']]
    }
    js_dic['dataKeyFromRiotKey'][champ_data['key']] = champion
    js_dic['dataKeyFromPrimeKey'][champ_data['primeKey']] = champion
    js_dic['dataKeyFromHumanName'][champ_data['name']] = champion

with open("jschamp_data.json", "w") as f:
    json.dump(js_dic, f)
