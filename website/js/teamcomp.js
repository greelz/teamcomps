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

// Prioritize focusing on a blank input box
// If not, then add a new box if there's fewer than 5
// Otherwise, do nothing.
function tryAddNewChampionInputElem() {
	var champion_elements, elem = getBlankInputElement(), new_input;
    if (elem) {
        elem.focus();
    }
	else {
		champion_elements = $$(".champion_input");
		if (champion_elements.length < 5) {
			new_input = createChampionInputElem();
			document.getElementById("championList").appendChild(new_input);
			new_input.focus();
		}
	}
}

function createChampionInputElem() {
	var div = dce("div"), elem = dce("input"), champ_names = [], champ;
	for (champ in championDictionary.data) {
		champ_names.push(championDictionary.data[champ].name)
	}
	addClass(elem, "champion_input");
	elem.placeholder = "Champion";
	autocomplete(elem, champ_names, tryAddNewChampionInputElem, getChampionImgSrc);
	div.appendChild(elem);
	return div;
}

function createChampionSection() {
    // First, create the 'filters' and their actions
    var roles = ['top', 'jg', 'mid', 'bot', 'supp']
    var positionsDiv = dce("div");
    positionsDiv.id = "positionsDiv";
    for (var idx in roles) {
        var role = roles[idx];
        var btn = createFilterButton(role);
        positionsDiv.appendChild(btn);
    }
    $("#champs").appendChild(positionsDiv);

    for (var i in championDictionary.data) {
        $('#champs').appendChild(createChampionCard(i));
    }
}

function createFilterButton(role) {
    var img = dce('img');
    img.src = "./images/positions/" + role + ".png";
    bindEvent(img, "click", function() {
        var str = "data-selected";
        var reset = false;
        if (img.getAttribute(str)) {
            reset = true;
            img.setAttribute(str, undefined);
            removeClass(img, "selected");
        }
        else {
            img.setAttribute(str, "1");
            addClass(img, "selected")
        }
        var champions = $$(".champ");
        for (let champion of champions) {
            var dataName = champion.getAttribute("data-name");
            if (!reset && (championDictionary.data[dataName].roles.indexOf(role) === -1)) {
                addClass(champion, "nodisp");
            }
            else {
                removeClass(champion, "nodisp");
            }
        }
    });
    return img;
}

function createChampionCard(name) {
	var d = dce("div");
	var i = dce("img");
	var p = dce("p");
	var pretty_name = championDictionary.data[name].name; 
	d.className = "champ";
    d.setAttribute('data-name', name);
	i.src = "images/champions/" + name + ".png";
	p.innerHTML = pretty_name;
	d.appendChild(i);
	d.appendChild(p);
	bindEvent(d, "click", function () {
		addChampToSearch(pretty_name);
	});
	return d;
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

function getChampionImgSrc(champion) {
    // Since we'll have the champion display name, reformat it to
    // grab the champion key
	champion = championDictionary.dataKeyFromHumanName[champion];
	if (champion) {
		return "images/champions/" + champion + ".png";
	}
	return "";
}


function addChampToSearch(champ_name) {
	var elemToChange = getBlankInputElement();
	var all_elements;
	if (!elemToChange) {
		// We'll just grab the last one to modify, maybe there's an invalid field or something
		all_elements = $$(".champion_input");
		elemToChange = all_elements[all_elements.length - 1];
	}

	elemToChange.value = champ_name;
	elemToChange.dispatchEvent(new Event("set_text"));
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
    table = dce("table");
    addClass(table, "tableCenter");
    row = dce("tr");
    table.appendChild(row);
    for (i; i < champIds.length; i += 1) {
        cell = dce("td");
        row.appendChild(cell);

        // Champion Image
        img = dce("img");
        img.src = getChampionImgSrc(champIds[i]);
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

        p = dce("p");
        p.innerText = "Next best champion: " + getChampionName(best_champ);
        fragment.appendChild(p);

        p = dce("p");
        p.innerText = "Win Percentage: " + (winPercent * 100).toFixed(1) + "%";
        fragment.appendChild(p);

        p = dce("p");
        p.innerText = total_games + " games played together.";
        fragment.appendChild(p);
    } else {
        p = dce("p");
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
        p = dce("p");
        p.innerText = "Win Percentage: " + (winPercent * 100).toFixed(1) + "%";
        fragment.appendChild(p);

        p = dce("p");
        p.innerText = total_games + " games analyzed.";
        fragment.appendChild(p);
    } else {
        p = dce("p");
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
            elem.innerText = "Night Mode";
        } else if (mode === "night") {
            $("#themeStylesheet").href = "styles/nightTheme.css";
            for (i = 0; i < images.length; i += 1) {
                images[i].src = images[i].src.replace(".png", "Dark.png");
            }
            setCookie("theme", "night");
            elem.innerText = "Light Mode";
        }
    }
}

// ---------- Operations after loading the page ----------
tryAddNewChampionInputElem();
createChampionSection();

if (getCookie("theme") === "night") {
    changeTheme("night");
}

bindEvent($("#themeButton"), "click", function (event) {
    if (event.target.innerText === "Night Mode") {
        changeTheme("night", event.target);
    } else {
        changeTheme("light", event.target);
    }
});

/*
bindEvent($("#winPercentBtn"), "click", function () {
    search("http://teamcomp.org:8000/winPercentage?", winPercentCallback);
});

bindEvent($("#nextBestChampBtn"), "click", function () {
    search("http://teamcomp.org:8000/nextbestchamp?", bestChampCallback);
});

callAjax("http://teamcomp.org:8000/totalGames", function (response) {
    $("#totalGames").innerText = response + " games.";    
});
*/


