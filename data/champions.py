from urllib import request
import time
import random

champions = '''Aatrox
Ahri
Akali
Alistar
Amumu
Anivia
Annie
Ashe
AurelionSol
Azir
Bard
Blitzcrank
Brand
Braum
Caitlyn
Camille
Cassiopeia
Chogath
Corki
Darius
Diana
DrMundo
Draven
Ekko
Elise
Evelynn
Ezreal
Fiddlesticks
Fiora
Fizz
Galio
Gangplank
Garen
Gnar
Gragas
Graves
Hecarim
Heimerdinger
Illaoi
Irelia
Ivern
Janna
JarvanIV
Jax
Jayce
Jhin
Jinx
Kalista
Karma
Karthus
Kassadin
Katarina
Kayle
Kayn
Kennen
Khazix
Kindred
Kled
KogMaw
Leblanc
LeeSin
Leona
Lissandra
Lucian
Lulu
Lux
Malphite
Malzahar
Maokai
MasterYi
MissFortune
Mordekaiser
Morgana
Nami
Nasus
Nautilus
Nidalee
Nocturne
Nunu
Olaf
Orianna
Ornn
Pantheon
Poppy
Quinn
Rakan
Rammus
RekSai
Renekton
Rengar
Riven
Rumble
Ryze
Sejuani
Shaco
Shen
Shyvana
Singed
Sion
Sivir
Skarner
Sona
Soraka
Swain
Syndra
TahmKench
Taliyah
Talon
Taric
Teemo
Thresh
Tristana
Trundle
Tryndamere
TwistedFate
Twitch
Udyr
Urgot
Varus
Vayne
Veigar
Velkoz
Vi
Viktor
Vladimir
Volibear
Warwick
MonkeyKing
Xayah
Xerath
XinZhao
Yasuo
Yorick
Zac
Zed
Ziggs
Zilean
Zoe
Zyra'''

user_agents = ["Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36", "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.2309.372 Safari/537.36",
             "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/4E423F"]

count = 0
for champ in champions.split("\n"):
    count += 1
    agent = user_agents[random.randint(0,2)]
    header = { 'User-Agent' : agent }
    print(champ)
    with open(str(champ) + ".png","wb") as f:
        req = request.Request("https://ddragon.leagueoflegends.com/cdn/7.23.1/img/champion/<champ>.png".replace("<champ>",champ),
                              data=None,headers=header)
        file = request.urlopen(req)
        f.write(file.read())
