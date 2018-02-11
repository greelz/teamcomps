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
            // TODO -- add the image to elem.parent as <img>
            saveAutocompleteToInput(elem, li_item.innerText, 24);
            doOfficialSearch(elem.value);
        }
        else {
            var li = $(".autocomplete li");
            // In this case, we have something that may be auto-completed
            // So we'll search the top result
            // Otherwise, either they're typing super fast, or they have random data
            // And we'll try to search anyways
            if (li) {
                saveAutocompleteToInput(elem, li.innerText, 24);
                doOfficialSearch(li.innerText);
            }
            else {            
                // Probably doing nothing here...
                if (elem && elem.value && elem.value.length > 0) {
                    doOfficialSearch(elem.value);
                }
            }
        }
        removeElement($(".autocomplete"));
    }

    function saveAutocompleteToInput(elem, champion_name, size) {
        elem.value = champion_name;
        var img = createChampionImg(champion_name, size);
        img.style = "width: 31px; margin-top: 4px";
        addClass(elem, "slimFromPic");
        elem.parentNode.insertBefore(img, elem);
    }

    function addListItem(champion_name, ul) {
        var li = document.createElement("li");
        li.addEventListener("click", function() {
            saveAutocompleteToInput(elem, this.innerText, 48);
            doOfficialSearch(this.innerText);
            removeElement($(".autocomplete"));
        });
        li.addEventListener("mousemove", function() {
            removeClass($(".highlighted_search"), "highlighted_search");
            addClass(this, "highlighted_search");
        });
        ul.appendChild(li);
        li.innerHTML = champion_name.replace(new RegExp(elem.value, "gi"), "<strong>" + '$&' + "</strong>");
        ul.insertBefore(createChampionImg(champion_name, 24), li);
    }

    function createChampionImg(champion, size) {
        var img = document.createElement("img");
        img.src = "images/champions/" + champion.replace(" ", "").replace(".", "").replace("'", "") + size + ".png";
        addClass(img, "left");
        return img;
    }
    
    function drawAutocomplete(suggestions) {
        // If the user is typing again, remove the img we created
        // if it exists
        var autocomplete_elem = $(".autocomplete");
        removeElement(autocomplete_elem);
        var node = document.createElement("div");
        addClass(node, "autocomplete");
        var ul = document.createElement("ul");
        node.appendChild(ul);
        for (var i = 0; i < suggestions.length; ++i) {
            addListItem(suggestions[i], ul);
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
            var items = $$(".autocomplete li");
            if (currentAutocomplete) {
                removeClass(currentAutocomplete, "highlighted_search");
                // Find the index of the autocomplete element
                // so we can scroll to the next item properly
                for (var i = 0; i < items.length; ++i) {
                    if (items[i] === currentAutocomplete) {
                        break;
                    }
                }
                if (direction === "up") {
                    if (i === 0) i = items.length - 1;
                    else i -= 1;
                    addClass(items[i], "highlighted_search");
                    items[0].parentNode.parentNode.scrollTop = items[i].offsetTop - 50;
                }
                else {
                    if (i >= items.length - 1) i = 0;
                    else i += 1;
                    addClass(items[i], "highlighted_search");
                    items[0].parentNode.parentNode.scrollTop = items[i].offsetTop - 50;
                }
            }
            else {
                if (direction === "up") {
                    addClass(items[items.length - 1], "highlighted_search");
                    items[0].parentNode.parentNode.scrollTop = items[items.length - 1].offsetTop - 50;
                }
                else {
                    addClass(items[0], "highlighted_search");
                }
            }
        }
    }

    function doOfficialSearch(val) {
        if (callback) callback(val);
    }
    
    bindEvent(document, "click", function(event) {
        if (searchTimer) clearTimeout(searchTimer);
        var searchTimer = setTimeout(function() {
            var autocomplete = $(".autocomplete");
            if (autocomplete && autocomplete.getAttribute("data-lostfocus") == "true")
            {
                removeElement($(".autocomplete"));
            }
        }, 100);
    });
    
    bindEvent(elem, "keydown", function(event) {
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
    });
    
    bindEvent(elem, "keyup", function(event) {
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
            removeClass(elem, "slimFromPic");
            removeElement(elem.previousSibling);
            doOnDelay(search, 150);
        }
    });
}
