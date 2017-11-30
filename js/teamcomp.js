var champions = ["Wukong", "Jax", "Fiddlesticks", "Shaco", "Warwick", "Xayah", "Nidalee", "Zyra", "Kled", "Brand", "Rammus", "Illaoi", "Corki", "Braum", "Darius", "Tryndamere", "Miss Fortune", "Yorick", "Xerath", "Sivir", "Riven", "Orianna", "Gangplank", "Malphite", "Poppy", "Karthus", "Jayce", "Nunu", "Trundle", "Graves", "Zoe", "Gnar", "Lux", "Shyvana", "Renekton", "Fiora", "Jinx", "Kalista", "Fizz", "Kassadin", "Sona", "Irelia", "Viktor", "Rakan", "Kindred", "Cassiopeia", "Maokai", "Ornn", "Thresh", "Kayle", "Hecarim", "Kha'Zix", "Olaf", "Ziggs", "Syndra", "Dr. Mundo", "Karma", "Annie", "Akali", "Volibear", "Yasuo", "Kennen", "Rengar", "Ryze", "Shen", "Zac", "Talon", "Swain", "Bard", "Sion", "Vayne", "Nasus", "Kayn", "Twisted Fate", "Cho'Gath", "Udyr", "Lucian", "Ivern", "Leona", "Caitlyn", "Sejuani", "Nocturne", "Zilean", "Azir", "Rumble", "Morgana", "Taliyah", "Teemo", "Urgot", "Amumu", "Galio", "Heimerdinger", "Anivia", "Ashe", "Vel'Koz", "Singed", "Skarner", "Varus", "Twitch", "Garen", "Blitzcrank", "Master Yi", "Elise", "Alistar", "Katarina", "Ekko", "Mordekaiser", "Lulu", "Camille", "Aatrox", "Draven", "Tahm Kench", "Pantheon", "Xin Zhao", "Aurelion Sol", "Lee Sin", "Taric", "Malzahar", "Lissandra", "Diana", "Tristana", "Rek'Sai", "Vladimir", "Jarvan IV", "Nami", "Jhin", "Soraka", "Veigar", "Janna", "Nautilus", "Evelynn", "Gragas", "Zed", "Vi", "Kog'Maw", "Ahri", "Quinn", "LeBlanc", "Ezreal"]

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

function addAnotherChampionSelector() 
{
    if (!tryFocusOnBlankInput()) {
        if ($$(".champion_input").length < 5 && getBlankInputElement() === null) {
            addChampionSearchElem();
        }
    }
}

function addChampionSearchElem() {
    var new_elem = document.createElement("input");
    addClass(new_elem, "champion_input");
    new_elem.placeholder = "Champion";
    autocomplete(new_elem, champions, addAnotherChampionSelector);
    $("#championList").insertAdjacentElement("beforeend", new_elem);
    new_elem.focus();
}

function search() {
    var champions = $$(".champion_input");
    var champ_list = [];
    for (var node = 0; node < champions.length; ++node) {
        champ_list.push(champions[node].value);
    }
    callAjax("http://localhost:5000/search", champ_list.join(""));
    searchResponse(champ_list, responseFromDatabase);
}

function searchResponse(champ_list, response) {
    removeElement($("#recommendations").querySelector("table"));
    for (var i in response.championGroups) {
        for (var newChamp in response['championGroups'][i]) {
            drawNewResult(champ_list, newChamp, response['championGroups'][i][newChamp]);
        }
    }
}

function drawNewResult(champ_list, newChamp, winningPercentage) {
    var responseSection = $("#recommendations");
    var table = responseSection.querySelector("table");
    if (!table) {
        table = document.createElement("table");
        addClass(table, "resultTable");        
    }
    var row = document.createElement("tr");
    table.appendChild(row);
    for (var champ in champ_list) {
        if (champ_list[champ].length > 0) {
            var cell = document.createElement("td");
            var text = document.createTextNode(champ_list[champ]);
            cell.appendChild(text);
            row.appendChild(cell);
        }
    }
    
    // New Champion
    cell = document.createElement("td");
    row.appendChild(cell);
    addClass(cell, "specialChamp");
    text = document.createTextNode(newChamp);
    cell.appendChild(text);
    
    // Winning percentage
    cell = document.createElement("td");
    row.appendChild(cell);
    addClass(cell, "winningPercentage");
    text = document.createTextNode(winningPercentage);
    cell.appendChild(text);
    
    // Cool bar graph
    cell = document.createElement("td");
    row.appendChild(cell);
    addClass(cell, "barGraph");
    var winPercent = Number(winningPercentage.substr(0, 2));
    addClass(cell, winPercent < 47 ? "red" : winPercent < 51 ? "orange" : "green");
    
    
    // Add the table at the end
    responseSection.appendChild(table);
}

autocomplete($("#first_champion"), champions, addAnotherChampionSelector);


var responseFromDatabase = {
    championGroups: { "AhriFiddlesticksBlitzcrankMalphite": {
            "Yasuo": "50%", "Ezreal": "44%", "Caitlyn": "59%",
        }
    }
}




















