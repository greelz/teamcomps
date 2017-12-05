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
    for li
