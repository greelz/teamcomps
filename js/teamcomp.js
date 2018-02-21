'use strict';
/*global $, $$, document, addClass, removeClass, autocomplete,
         championDictionary, callAjax, setCookie, getCookie, bindEvent */
function getBlankInputElement() {
    var champion_elements = $$(".champion_input"), i, elem;
    for (i = 0; i < champion_elements.length; i += 1) {
        elem = champion_elements[i];
        // Check to see if any element is null, and if so, focus on it
        if (elem.value === "") {
            return elem;
        }
    }
    return null;
}

function tryFocusOnBlankInput() {
    var elem = getBlankInputElement();
    if (elem) {
        elem.focus();
        return true;
    }
    return false;
}

function getChampionKey(val) {
    if (championDictionary.name[val]) {
        return championDictionary.name[val].key;
    }
    if (championDictionary.id[val]) {
        return championDictionary.id[val].key;
    }
    if (championDictionary.key[val]) {
        return val;
    }
    return null;
}

function getChampionName(val) {
    if (championDictionary.name[val]) {
        return val;
    }
    if (championDictionary.id[val]) {
        return championDictionary.id[val].name;
    }
    if (championDictionary.key[val]) {
        return championDictionary.key[val].name;
    }
    return null;
}

function getChampionImgSrc(champion, size) {
    // Since we'll have the champion display name, reformat it to
    // grab the champion key
    var champKey = getChampionKey(champion);
    if (champKey) {
        return "images/champions/" + champKey + size + ".png";
    }
    console.log("Couldn't find an image for: " + champion + ".");
    return null;
}

function search(url, callback) {
    var champions = $$(".champion_input"), query, node, champ, champFromDic, searchCallback;
    query = "";
    for (node = 0; node < champions.length; node += 1) {
        champ = champions[node].value;
        champFromDic = championDictionary.name[champ];
        if (champFromDic) {
            query += "&champ" + (node + 1) + "=" + champFromDic.id;
        }
    }
    if (query.length > 0) {
        query = query.substring(1);
        drawPhrasesAndSearch(url + query, callback);
    }
}


// --------- Request Callbacks -----------

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function drawPhrasesAndSearch(url, callback) {
    // Not sure I love this one yet... but it let's us do callbacks with an interval
    // and guarantee that we can end the interval with the second callback
    var phrases, parentElem, numPhrases, drawingInterval;
    callAjax("http://teamcomp.org:8000/coolPhrases", function (response) {
        phrases = JSON.parse(response);
        numPhrases = phrases.length;
        parentElem = $("#recommendations");
        parentElem.innerHTML = phrases[getRandomInt(numPhrases)];
        drawingInterval = setInterval(function () {
            parentElem.innerHTML = phrases[getRandomInt(numPhrases)];
        }, 700);
        callAjax(url, callback, drawingInterval);
    });
}

function createChampionTable(champIds) {
    var i = 0, table, row, cell, img;
    table = document.createElement("table");
    addClass(table, "tableCenter");
    row = document.createElement("tr");
    table.appendChild(row);
    for (i; i < champIds.length; i += 1) {
        cell = document.createElement("td");
        row.appendChild(cell);

        // Champion Image
        img = document.createElement("img");
        img.src = getChampionImgSrc(champIds[i], 48);
        cell.appendChild(img);

    }
    return table;
}

function bestChampCallback(response) {
    var winPercent, total_games, champIds, best_champ, fragment, table, p;
    response = JSON.parse(response);
    winPercent = response.win_percent;
    total_games = response.total_games;
    champIds = response.champIds;
    best_champ = response.champId;
    fragment = document.createDocumentFragment();

    if (best_champ) {
        table = createChampionTable([best_champ].concat(champIds));
        fragment.appendChild(table);

        p = document.createElement("p");
        p.innerText = "Next best champion: " + getChampionName(best_champ);
        fragment.appendChild(p);

        p = document.createElement("p");
        p.innerText = "Win Percentage: " + (winPercent * 100).toFixed(1) + "%";
        fragment.appendChild(p);

        p = document.createElement("p");
        p.innerText = total_games + " games played together.";
        fragment.appendChild(p);
    } else {
        p = document.createElement("p");
        p.innerText = "Sadly, we don't have enough data for these champions.";
        fragment.appendChild(p);
    }
    $("#recommendations").innerHTML = "";
    $("#recommendations").appendChild(fragment);
}

function winPercentCallback(response) {
    var winPercent, total_games, champIds, fragment, table, p;
    response = JSON.parse(response);
    $("#recommendations").innerHTML = "";
    winPercent = response.win_percent;
    total_games = response.total_games;
    champIds = response.champIds;
    fragment = document.createDocumentFragment();
    if (total_games > 0) {
        table = createChampionTable(champIds);
        fragment.appendChild(table);
        p = document.createElement("p");
        p.innerText = "Win Percentage: " + (winPercent * 100).toFixed(1) + "%";
        fragment.appendChild(p);

        p = document.createElement("p");
        p.innerText = total_games + " games analyzed.";
        fragment.appendChild(p);
    } else {
        p = document.createElement("p");
        p.innerText = "Sadly, we don't have enough data for these champions.";
        fragment.appendChild(p);
    }
    $("#recommendations").appendChild(fragment);
}

// ---------- Theming ----------
function changeTheme(mode, elem) {
    var noChangesNecessary = $("#themeStylesheet").href.endsWith(mode + "Theme.css"), images = $$("img.themed"), i;

    if (!noChangesNecessary) {
        if (!elem) {
            elem = $("#themeButton");
        }
        if (mode === "light") {
            $("#themeStylesheet").href = "styles/lightTheme.css";
            for (i = 0; i < images.length; i += 1) {
                images[i].src = images[i].src.replace("Dark.png", ".png");
            }
            setCookie("theme", "light");
            elem.value = "Night Mode";
        } else if (mode === "night") {
            $("#themeStylesheet").href = "styles/nightTheme.css";
            for (i = 0; i < images.length; i += 1) {
                images[i].src = images[i].src.replace(".png", "Dark.png");
            }
            setCookie("theme", "night");
            elem.value = "Light Mode";
        }
    }
}

// ---------- Operations after loading the page ----------
(function () {
    var inputs = $$(".champion_input"), idx;
    for (idx = 0; idx < inputs.length; idx += 1) {
        autocomplete(inputs[idx], Object.keys(championDictionary.name), tryFocusOnBlankInput, getChampionImgSrc);
    }
}());

if (getCookie("theme") === "night") {
    changeTheme("night");
}

bindEvent($("#themeButton"), "click", function (event) {
    if (event.target.value === "Night Mode") {
        changeTheme("night", event.target);
    } else {
        changeTheme("light", event.target);
    }
});

bindEvent($("#winPercentBtn"), "click", function () {
    search("http://teamcomp.org:8000/winPercentage?", winPercentCallback);
});

bindEvent($("#nextBestChampBtn"), "click", function () {
    search("http://teamcomp.org:8000/nextbestchamp?", bestChampCallback);
});

callAjax("http://teamcomp.org:8000/totalGames", function (response) {
    $("#totalGames").innerText = response + " games.";    
});
