function getBlankInputElement()
{
    var champion_elements = $$(".champion_input");
    for (var i = 0; i < champion_elements.length; ++i) {
        var elem = champion_elements[i];
        // Check to see if any element is null, and if so, focus on it
        if (elem.value === "") {
            return elem;
        }
    }
    return null;
}

function tryFocusOnBlankInput()
{
    var elem = getBlankInputElement();
    if (elem) {
        elem.focus();
        return true;
    }
    return false;
}

function getChampionKey(val) {
    if (championDictionary.name[val]) {
        return championDictionary.name[val]['key'];
    }
    if (championDictionary.id[val]) {
        return championDictionary.id[val]['key'];
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
        return championDictionary.id[val]['name'];
    }
    if (championDictionary.key[val]) {
        return championDictionary.key[val]['name'];
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
    else {
        console.log("Couldn't find an image for: " + champion + ".");
        return null;
    }
}
    
function search(url, callback) {
    var champions = $$(".champion_input");
    var query = "";
    for (var node = 0; node < champions.length; ++node) {
        var champ = champions[node].value;
        var champFromDic = championDictionary.name[champ];
        if (champFromDic) {
            query += "&champ" + (node + 1) + "=" + champFromDic['id'];
        }
    }
    if (query.length > 0) {
        query = query.substring(1);
        callAjax(url + query, callback);
    }
}


// --------- Request Callbacks -----------
function bestChampCallback(response) {
    response = JSON.parse(response);
    var winPercent = response['win_percent'];
    var total_games = response['total_games'];
    var champIds = response['champIds'];
    var wins = response["wins"];
    var best_champ = response["champId"];
    var fragment = document.createDocumentFragment();

    if (best_champ) {
        var table = createChampionTable([best_champ].concat(champIds));
        fragment.appendChild(table);

        var p = document.createElement("p")
        p.innerText = "Next best champion: " + getChampionName(best_champ);
        fragment.appendChild(p);

        p = document.createElement("p")
        p.innerText = "Win Percentage: " + (winPercent * 100).toFixed(1) + "%";
        fragment.appendChild(p);

        p = document.createElement("p")
        p.innerText = total_games + " games played together.";
        fragment.appendChild(p);
    }
    else {
        var p = document.createElement("p");
        p.innerText = "Sadly, we don't have enough data for these champions.";
        fragment.appendChild(p);
    }
    $("#recommendations").innerHTML = ""; 
    $("#recommendations").appendChild(fragment);
}

function winPercentCallback(response) {
    response = JSON.parse(response);
    $("#recommendations").innerHTML = ""; 
    var winPercent = response['win_percent'];
    var total_games = response['total_games'];
    var champIds = response['champIds'];
    var fragment = document.createDocumentFragment();
    if (total_games > 0) {
        var table = createChampionTable(champIds);
        fragment.appendChild(table);
        var p = document.createElement("p")
        p.innerText = "Win Percentage: " + (winPercent * 100).toFixed(1) + "%";
        fragment.appendChild(p);

        p = document.createElement("p")
        p.innerText = total_games + " games analyzed.";
        fragment.appendChild(p);
    }
    else {
        var p = document.createElement("p");
        p.innerText = "Sadly, we don't have enough data for these champions.";
        fragment.appendChild(p);
    }
    $("#recommendations").appendChild(fragment);
}

function createChampionTable(champIds) {
    var i = 0, div, table, row, cell, img;
    table = document.createElement("table");
    addClass(table, "tableCenter");
    row = document.createElement("tr");
    table.appendChild(row);
    for (i; i < champIds.length; ++i) {
        cell = document.createElement("td");
        row.appendChild(cell);

        // Champion Image
        img = document.createElement("img");
        img.src = getChampionImgSrc(champIds[i], 48);
        cell.appendChild(img);

    }
    return table;
}

// ---------- Theming ----------
function changeTheme(mode, elem) {
    var noChangesNecessary = $("#themeStylesheet").href.endsWith(mode + "Theme.css");
    var images = $$("img.themed");

    if (!noChangesNecessary) {
        if (!elem) elem = $("#themeButton");
        if (mode === "light") {
            $("#themeStylesheet").href = "styles/lightTheme.css";
            for (var i = 0; i < images.length; ++i) {
                images[i].src = images[i].src.replace("Dark.png", ".png");
            }
            setCookie("theme", "light");
            elem.value = "Night Mode"
        }
        else if (mode === "night") {
            $("#themeStylesheet").href = "styles/nightTheme.css";
            for (var i = 0; i < images.length; ++i) {
                images[i].src = images[i].src.replace(".png", "Dark.png");
            }
            setCookie("theme", "night");
            elem.value = "Light Mode"
        }
    }
}


// ---------- Operations after loading the page ----------
var inputs = $$(".champion_input");
for (var idx = 0; idx < inputs.length; ++idx) {
    autocomplete(inputs[idx], Object.keys(championDictionary.name), tryFocusOnBlankInput, getChampionImgSrc);
}

if (getCookie("theme") === "night") {
    changeTheme("night");
}

bindEvent($("#themeButton"), "click", function(event) {
    if (event.target.value === "Night Mode") {
        changeTheme("night", event.target);
    }
    else {
        changeTheme("light", event.target);
    }
});

bindEvent($("#winPercentBtn"), "click", function(event) {
    search("http://127.0.0.1:8000/winPercentage?", winPercentCallback);
});

bindEvent($("#nextBestChampBtn"), "click", function(event) {
    search("http://127.0.0.1:8000/nextbestchamp?", bestChampCallback);
});
