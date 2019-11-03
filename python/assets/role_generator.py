from bs4 import BeautifulSoup as bs4
import requests
import json

def getChampionRoles():
    page = requests.get("http://leagueoflegends.fandom.com/wiki/List_of_champions/Position").content
    soup = bs4(page, "html.parser")

    table = soup.find("table", class_="article-table")
    rows = table.find_all("tr")
    # Table looks like this...
    # Champion Name     Top?     Jg?     Mid?     Bot?     Supp?     Unplayed?
    champ_dic = {}
    id_map = {
        1: 'top',
        2: 'jg',
        3: 'mid',
        4: 'bot',
        5: 'supp',
    }
    for champion_row in rows:
        cells = champion_row.find_all("td")
        if len(cells) > 0:
            name = cells[0]['data-sort-value']
            champ_dic[name] = []
            for i in range(1, 6):
                if 'data-sort-value' in cells[i].attrs:
                    champ_dic[name].append(id_map[i])

    return champ_dic
