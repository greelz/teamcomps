import flask
import json


app = flask.Flask(__name__)

champions = {}
with open("champions.json", "r") as f:
    champions = json.load(f)
    lower_vals = { champions['data'][x]['name'].lower():\
                   y for x, y in champions['data'].items() }
    champions['data'] = lower_vals

@app.route("/")
def hello():
    return "Hello world."

@app.route("/champions", methods=['GET'])
def get_champions():
    resp = flask.make_response(json.dumps(champions))
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp

@app.route("/champions/<string:champ>", methods=['GET'])
def get_champion(champ):
    champ = champ.lower()
    response = []
    for champion in champions['data']:
        if champ in champion:
            response.append(champions['data'][champion]['name'])
    resp = flask.make_response(json.dumps(response))
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp

app.run()
