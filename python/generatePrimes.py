import json
import os

primes = [2]
is_prime = False

def getPrimes(num):
    for i in range(3, 10000):
        is_prime = True
        for p in primes:
            if i % p == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(i)
        if len(primes) > num:
            break

    return primes


def modifyRunningData():
    with open("running_data.json", "r") as f:
        my_dic = json.load(f)

    if not 'matches_processed' in my_dic:
        my_dic['matches_processed'] = {}
    for root, dirs, files in os.walk("../data/matchData"):
        for filename in files:
            my_dic['matches_processed'][filename[:-5]] = 1

    with open("running_data2.json", "w") as f:
        json.dump(my_dic, f)
