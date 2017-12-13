function autocomplete(elem, source, callback)
{
    // We want to allow someone to pass some callback
    // into the args parameter so that we can do something
    // with the search
    
    if (Array.isArray(source)) {
        source = source.sort();
        var associatedArray = [];
        for (var i = 0; i < source.length; ++i) {
            associatedArray.push(source[i].toLowerCase());
        }
    }
    
    function handleEnter() {
        var li_item = $(".highlighted_search");
        if (li_item) {
            // Then we just want to select that element and move on
            // Add the full text, and do an "official search"
            elem.value = li_item.innerText;
            doOfficialSearch(elem.value);
        }
        else {
            var ac = $(".autocomplete");
            // In this case, we have something that may be auto-completed
            // So we'll search the top result
            // Otherwise, either they're typing super fast, or they have random data
            // And we'll try to search anyways
            if (ac && ac.firstChild && ac.firstChild.firstChild) {
                elem.value = ac.firstChild.firstChild.innerText;
                doOfficialSearch(ac.firstChild.firstChild.innerText);
            }
            else {            
                if (elem && elem.value && elem.value.length > 0) {
                    doOfficialSearch(elem.value);
                }
            }
        }
        removeElement($(".autocomplete"));
    }
    
    function drawAutocomplete(suggestions) {
        var autocomplete_elem = $(".autocomplete");
        removeElement(autocomplete_elem);
        var node = document.createElement("div");
        addClass(node, "autocomplete");
        node.addEventListener("mouseleave", function() {
            node.setAttribute("data-lostfocus", true);
        });
        
        node.addEventListener("focus", function() {
            node.setAttribute("data-lostfocus", false); 
        });
        
        var ul = document.createElement("ul");
        node.appendChild(ul);
        for (var i = 0; i < suggestions.length; ++i) {
            var li = document.createElement("li");
            li.addEventListener("click", function() {
                elem.value = this.innerText;
                doOfficialSearch(this.innerText);
                removeElement($(".autocomplete"));
            });
            li.addEventListener("mousemove", function() {
                removeClass($(".highlighted_search"), "highlighted_search");
                addClass(this, "highlighted_search");
            });
            ul.appendChild(li);
            var champion_name = suggestions[i];
            li.innerHTML = champion_name.replace(new RegExp(elem.value, "gi"), "<strong>" + '$&' + "</strong>");
        }
        // Don't add if you aren't the active element anymore (they hit enter or smth)
        if (elem == document.activeElement) {
            insertAfter(node, elem);
        }
    }

    function search(val) {
        if (elem && elem.value !== "") {
            var searchVal = elem.value.toLowerCase();
            if (typeof source === "string") {
                callAjax(source + searchVal, function(response) {
                    var champs = JSON.parse(response);
                    drawAutocomplete(champs);
                });
            }
            else {
                var elements = [];
                for (var i = 0; i < associatedArray.length; ++i) {
                    if (associatedArray[i].indexOf(searchVal) > -1) {
                        if (associatedArray[i].startsWith(searchVal)) {
                            elements.push([source[i], 1]);
                        }
                        else if (associatedArray[i].endsWith(searchVal)) {
                            elements.push([source[i], 3]);
                        }
                        else {
                            elements.push([source[i], 2]);
                        }
                    }
                }
                elements.sort(function(a, b) { 
                    if (a[1] < b[1]) return -1;
                    if (a[1] > b[1]) return 1;
                    return 0;
                });
                var result = [];
                for (i = 0; i < elements.length; ++i) {
                    result.push(elements[i][0]);
                }
                drawAutocomplete(result);
            }
        }
        else {
            removeElement($(".autocomplete"));
        }
    }

    function moveToAutocomplete(direction) {
        var autocomplete = $(".autocomplete");
        if (autocomplete)
        {
            var currentAutocomplete = $(".highlighted_search");
            if (currentAutocomplete) {
                removeClass(currentAutocomplete, "highlighted_search");
                if (direction === "up") {
                    if (currentAutocomplete.previousSibling) {
                        addClass(currentAutocomplete.previousSibling, "highlighted_search");
                    }
                }
                else {
                    if (currentAutocomplete.nextSibling) {
                        addClass(currentAutocomplete.nextSibling, "highlighted_search");
                    }
                }
            }
            else {
                if (direction === "up") {
                    addClass(autocomplete.firstChild.lastChild, "highlighted_search");
                }
                else {
                    addClass(autocomplete.firstChild.firstChild, "highlighted_search");
                }
            }
        }
    }

    function doOfficialSearch(val) {
        if (callback) callback(val);
    }
    
    document.addEventListener("click", function(event) {
        if (searchTimer) clearTimeout(searchTimer);
        var searchTimer = setTimeout(function() {
            var autocomplete = $(".autocomplete");
            if (autocomplete && autocomplete.getAttribute("data-lostfocus") == "true")
            {
                removeElement($(".autocomplete"));
            }
        }, 100);
    });
    
    elem.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) { // enter key
            event.preventDefault();
        }
        else if (event.keyCode === 40) { // down arrow
            event.preventDefault();
        }
        else if (event.keyCode === 38) { // up arrow
            event.preventDefault();
        }
        else if (event.keyCode === 9) { // tab key
            if ($(".autocomplete")) {
                event.preventDefault();
            }
        }
    })
                
    elem.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) { // enter key
            event.preventDefault();
            handleEnter();
            addAnotherChampionSelector();
        }
        else if (event.keyCode === 40) { // down arrow
            event.preventDefault();
            moveToAutocomplete("down");
        }
        else if (event.keyCode === 38) { // up arrow
            event.preventDefault();
            moveToAutocomplete("up");   
        }
        
        else if (event.keyCode === 9) { // tab key
            if ($(".autocomplete")) {
                moveToAutocomplete("down");
                event.preventDefault();
            }
        }
        else if (event && event.target) {
            doOnDelay(search, 150);
        }
    });    
}
