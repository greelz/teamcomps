import requests
import json
import sys
from pathlib import Path
import json
import generatePrimes as gp
import mysql.connector as msc
from datetime import datetime
from datetime import timezone
import traceback
import DBDriver as dbd

def pushMatchesToSite(directory):
    # it is assumed that directory is a valid path to a directory
    rowCount = 0
    matchDirPath = Path(directory)
    writeable_events = []

    for matchFile in matchDirPath.iterdir():
        with matchFile.open() as handle:
            try:
                matchDict = json.load(handle)

                temp_events = dbd.process_match(matchDict) # seperate this line and the next so that we can keep count of "valid" matches
                if (not temp_events):
                    continue # don't fail for malformed games
                
                rowCount += len(temp_events)
                writeable_events.extend(temp_events)

                if rowCount % 10000 == 0:
                    print('posting matches')
                    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
                    requests.post('http://localhost:2021/matches', data = json.dumps(writeable_events), headers = headers)
                    writeable_events.clear()

            except Exception as error:
                traceback.print_exc()
                print(f'Error processing match file {matchFile}')

    


if __name__ == "__main__":
    # Arguments
    # -d: directory to start at
    #     It is assumed that the directory provided has one to many <matchId>.json files

    num_args = len(sys.argv)
    directory = ""
    for indx, arg in enumerate(sys.argv):
        if indx == num_args -1:
            break
        if arg == '-d':
            directory = sys.argv[indx + 1]
    
    p = Path(directory)
    if not(p.exists() and p.is_dir()):
        print(f'It looks like the path provided, {directory}, does not exist or is not a directory. Check that it exists, and try again.')
        exit() 
    
    pushMatchesToSite(directory)
    



