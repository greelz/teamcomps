import json

def getPrimes(num):
    primes = [2]
    is_prime = False
    for i in range(3,1000000):
        is_prime = True
        for p in primes:
            if i % p == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(i)
        if len(primes) >= num:
            break
    return primes

primes = getPrimes(1000)
with open("champions.json", "r") as f:
    champions_dic = json.load(f)
    champ_dic = {}
    for champion in champions_dic['data']:
        champ_id = champions_dic['data'][champion]['id']
        champ_dic[champion.lower()] = champions_dic['data'][champion]['id']
        champions_dic['data'][champion]['prime_key'] = primes[champions_dic['data'][champion]['id'] - 1]
        
with open("champions3.json", "w") as r:
    json.dump(champ_dic, r, sort_keys=True)
        
