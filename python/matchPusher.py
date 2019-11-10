import requests
import json
import os
import sys
from pathlib import Path
import json
import generatePrimes as gp
import mysql.connector as msc
from datetime import datetime
from datetime import timezone
import traceback
import DBDriver as dbd

directory = "../../MatchData/EUW1"

writeable_events = []


for root, dirs, filenames in os.walk(directory):
        for filename in filenames:
            #get winners and losers
            fullFile = os.path.join(directory, filename)
            
            with open(fullFile, "r") as f:
                try:
                    matchDict = json.load(f)
                    temp_events = dbd.process_match(matchDict) # seperate this line and the next so that we can keep count of "valid" matches

                    if (not temp_events):
                        continue # don't fail for malformed games
                    writeable_events.extend(temp_events)
                        
                except Exception as error:
                    traceback.print_exc()
                     
headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}

r = requests.post('http://localhost:2021/matches', data = json.dumps(writeable_events), headers = headers)