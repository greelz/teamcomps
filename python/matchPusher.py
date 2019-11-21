import requests
import json
import sys
from pathlib import Path
import json
import traceback
import DBDriver as dbd
from zipfile import ZipFile


def pushMatchesToSiteFromZip(directory):
    rowCount = 0
    writeable_events = []
    if '.zip' not in directory:
        directory = directory + '.zip'
    with ZipFile(directory, 'r') as f:
        for filename in f.infolist():
            with f.open(filename) as match_json:
                try:
                    match = json.loads(match_json.read())
                    temp_events = dbd.process_match(match) # seperate this line and the next so that we can keep count of "valid" matches
                    if not temp_events:
                        continue # don't fail for malformed games
                    
                    rowCount += len(temp_events)
                    writeable_events.extend(temp_events)

                    if rowCount % 10000 == 0:
                        print('posting matches')
                        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
                        requests.post('http://teamcomps.org:2021/matches', data = json.dumps(writeable_events), headers = headers)
                        writeable_events.clear()
                except Exception as error:
                    pass


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
                    requests.post('http://teamcomps.org:2021/matches', data = json.dumps(writeable_events), headers = headers)
                    writeable_events.clear()

            except Exception as error:
                traceback.print_exc()
                print(f'Error processing match file {matchFile}')

    


if __name__ == "__main__":
    # Arguments
    # -d: directory to start at
    #     It is assumed that the directory provided has one to many <matchId>.json files

    num_args = len(sys.argv)
    # -z: whether or not the folder is a zipped file
    directory = ""
    for indx, arg in enumerate(sys.argv):
        if indx == num_args -1:
            break
        if indx == len(sys.argv) - 1:
            break
        elif arg == '-d':
            directory = sys.argv[indx + 1]
        elif arg == '-z':
            zipped = True

    if zipped:
        pushMatchesToSiteFromZip(directory)
    else:
        pushMatchesToSite(directory)
