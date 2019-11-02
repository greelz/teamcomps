import json
import math


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

    return primes

primes = getPrimesUpToN(50000)

