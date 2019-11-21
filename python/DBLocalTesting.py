import os
import sys
from pathlib import Path
import json
import generatePrimes as gp
import mysql.connector as msc
from datetime import datetime
import traceback

def loopOverFiles(directory):
    writeable_events = []
    num_processed = 0
    temp_events = []
    my_SQL_conn = msc.Connect(user = 'root', password='banana', host='127.0.0.1', database='teamcomps_db', port=3306) # TODO config
    cursor = my_SQL_conn.cursor()

    for _, _, filenames in os.walk(directory):
        for filename in filenames:
            #get winners and losers
            num_processed += 1
            fullFile = os.path.join(directory, filename)
            
            with open(fullFile, "r") as f:
                try:
                    matchDict = json.load(f)
                    temp_events = process_match(matchDict) # seperate this line and the next so that we can keep count of "valid" matches
                    num_processed += 1
                    if (not temp_events):
                        continue # don't fail for malformed games
                    writeable_events.extend(temp_events)

                    if(len(writeable_events) >= 1000):
                        # write events to database, and clear the array
                        cursor.executemany(insert_matches_command(), writeable_events)
                        writeable_events.clear()
                        
                        
                except Exception as error:
                    print(fullFile)
                    print(str(error))
                    traceback.print_exc()
                     

    if (writeable_events):
        cursor.executemany(insert_matches_command(), writeable_events)
    my_SQL_conn.commit()
    my_SQL_conn.close()
    print("Number matches processed: " + str(num_processed))
