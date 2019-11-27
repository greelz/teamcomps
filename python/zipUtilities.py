import os
import shutil
from zipfile import ZipFile


def createZip(directory, zipfile_name = None):
    directory = str(directory)
    if zipfile_name is None:
        zipfile_name = directory 
    if os.path.isdir(directory):
        shutil.make_archive(zipfile_name, "zip", directory)
    else:
        print(str(directory) + " is not directory, at least not to my knowledge.")


def getFilesFromZip(directory):
    directory = str(directory)
    if not directory.endswith("zip"):
        directory = directory + '.zip'

    with ZipFile(directory, 'r') as f:
        for filename in f.infolist():
            with f.open(filename) as match_json:
                yield match_json.read()

def deleteFilesInFolder(directory):
    if os.path.isdir(directory):
        shutil.rmtree(directory)
    os.makedirs(directory)

