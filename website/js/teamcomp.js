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

function autocompleteSaveCallback(champion_name) {
	// First, add a new champion input if we can
	tryAddNewChampionInputElem();

	// Then, execute the search (mocked for now)
	mockRequestResult(champion_name);
}

// Prioritize focusing on a blank input box
// If not, then add a new box if there's fewer than 5
// Otherwise, do nothing.
function tryAddNewChampionInputElem() {
	var champion_elements, elem = getBlankInputElement(), newDiv;
    if (elem) {
        elem.focus();
    }
	else {
		champion_elements = $$(".champion_input");
		if (champion_elements.length < 5) {
			newDiv = createChampionInputDiv();
			document.getElementById("championList").appendChild(newDiv);
			newDiv.firstChild.focus();
		}
	}
}

function createChampionInputDiv() {
	var div = dce("div"), elem = dce("input"), champ_names = [], champ;
	for (champ in championDictionary.data) {
		champ_names.push(championDictionary.data[champ].name)
	}
	addClass(elem, "champion_input");
	elem.placeholder = "Champion";
	autocomplete(elem, champ_names, autocompleteSaveCallback, getChampionImgSrc);
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
        var btn = createFilterButton(role, $("#champs"));
        positionsDiv.appendChild(btn);
    }
    $("#champs").appendChild(positionsDiv);

    for (var i in championDictionary.data) {
        $('#champs').appendChild(createChampionCard(i));
    }
}

function createFilterButton(role, div) {
    var img = dce('img');
    img.src = "./images/positions/" + role + ".png";
    img.title = role;
    bindEvent(img, "click", function() {
        var str = "data-selected";
        var reset = false;
        if (img.getAttribute(str) === "1") {
            reset = true;
            img.removeAttribute(str);
            removeClass(img, "selected");
        }
        else {
            for (let tempImg of $$("#positionsDiv img")) {
                removeClass(tempImg, "selected");
                tempImg.removeAttribute(str);
            }
            img.setAttribute(str, "1");
            addClass(img, "selected")
        }
        var champions = $$(".champ", div);
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

function getChampionImgSrc(champion_name, element) {
    // Since we'll have the champion display name, reformat it to
    // grab the champion key
	var img = dce("img");
	var champion = championDictionary.dataKeyFromHumanName[champion_name];
	img.src = "images/champions/" + champion + ".png";
	element.parentNode.insertBefore(img, element);
	addClass(element, "slimFromPic");
	addClass(img, "left");
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

function mockRequestResult() {
	// We'll simply mock a request until the web server actually has data
	// Jordan and I agreed that we'd have something that looks like this: <--- Matt lied here he actually assumed it would be { winPct: {decimal}, nextBestChampions: [{riotKey1, winPct1}, {riotKey2, winPct2}, ...]} :)
	// { winPct: .45454222, nextBestChampions: [riotKey1, riotKey2, ...] }
	var numChamps = 10;
	var availableChampions = Object.keys(championDictionary.dataKeyFromRiotKey), len = availableChampions.length;
	var startSlice = Math.min(len - numChamps, parseInt(Math.random() * len));
	var randomChamps = availableChampions.slice(startSlice, startSlice + numChamps);
	var current_champions = $$(".champion_input");
    var curr_champ_arr = [];
	for (let champ of current_champions) {
		var val = champ.value;
		if (val !== "") {
			var champName = championDictionary.dataKeyFromHumanName[val];
			if (champName) {
				var riotId = championDictionary.data[champName].key;
				curr_champ_arr.push(riotId);
			}
		}
    }
    
    callAjax("http://teamcomps.org:2021/getWinPercentAndNextChamps", function(response) 
    {
        drawResultToScreen(JSON.parse(response));
    }, null, JSON.stringify({'champs': curr_champ_arr}), "JSON");

	var mockResult = { 'championList': curr_champ_arr, 'winPct': Math.random(), 'nextBestChampions': randomChamps };

	// Normally, we'd do some sort of ajax call here (get request)
	// But now, I'll just simulate a delayed callback between 1-2 seconds... 
	// doOnDelay(drawResultToScreen, Math.random() * 2000, mockResult);
}

function drawResultToScreen(result) {
	var nextBest = $("#nextBest"), winPercent = $("#winPctP"), champName;
	nextBest.innerHTML = "";

    console.log(result);
	// Put the winning percentage on the screen...
    winPercent.innerHTML = formatPercent(result['winPercent']) + "%";
    
    nextBest.appendChild(p("Next best champions:", ["section_title"]));
	nextBest.appendChild(p("These 10 champions synergize the best with the above composition.", ['section_subtitle']));
    
    for (var i in result.nextBestChampions)
    {
        var championId = result.nextBestChampions[i].champId;
        champName = championDictionary.dataKeyFromRiotKey[championId];
		var subsequentChamp = createChampionCard(champName);
		subsequentChamp.appendChild(p(formatPercent(result.nextBestChampions[i].winPercent) + "%"));
		nextBest.appendChild(subsequentChamp);
    }
}

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


