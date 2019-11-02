'use strict';
/*global $, $$, addClass, removeClass, document, removeElement, insertAfter, callAjax,
         bindEvent, doOnDelay */

function autocomplete(elem, source, searchCallback, styleCallback) {
    var associatedArray = [];

    (function generateAssociatedArray() {
        var i;
        if (Array.isArray(source)) {
            source = source.sort();
            for (i = 0; i < source.length; i += 1) {
                associatedArray.push(source[i].toLowerCase());
            }
        }
    }());

    // --------- DOM Manipulation ----------

    function createItemImage(item_name) {
        var img = document.createElement("img");
        img.src = styleCallback(item_name);
		addClass(img, "left");
        return img;
    }

    function saveAutocompleteToInput(elem, item_name) {
        elem.value = item_name;
        if (styleCallback) {
            var img = createItemImage(item_name);
            elem.parentNode.insertBefore(img, elem);
			addClass(elem, "slimFromPic");
        }
        if (searchCallback) {
            searchCallback(item_name);
        }
    }

    function handleEnter() {
        var li_item = $(".highlighted_search"), li;
        if (li_item) {
            saveAutocompleteToInput(elem, li_item.innerText);
        } else {
            li = $(".autocomplete li");
            // In this case, we have something that may be auto-completed
            // So we'll search the top result
            // Otherwise, either they're typing super fast, or they have random data
            // in which case we'll do just remove the autocomplete popup
            if (li) {
                saveAutocompleteToInput(elem, li.innerText);
            }
        }
        removeElement($(".autocomplete"));
    }

    function addListItem(item_name, ul) {
        var li = document.createElement("li");
        li.addEventListener("click", function () {
            saveAutocompleteToInput(elem, this.innerText);
            removeElement($(".autocomplete"));
        });
        li.addEventListener("mousemove", function () {
            removeClass($(".highlighted_search"), "highlighted_search");
            addClass(this, "highlighted_search");
        });
        li.innerHTML = item_name.replace(new RegExp(elem.value, "gi"), "<strong>" + '$&' + "</strong>");
        ul.appendChild(li);
        if (styleCallback) {
            ul.insertBefore(createItemImage(item_name), li);
        }
    }

    function drawAutocomplete(suggestions) {
        // If the user is typing again, remove the img we created
        // if it exists
        var autocomplete_elem = $(".autocomplete"), node, ul, i;
        removeElement(autocomplete_elem);
        node = document.createElement("div");
        addClass(node, "autocomplete");
        ul = document.createElement("ul");
        node.appendChild(ul);
        for (i = 0; i < suggestions.length; i += 1) {
            addListItem(suggestions[i], ul);
        }
        // Don't add if you aren't the active element anymore (they hit enter or smth)
        if (elem === document.activeElement) {
            insertAfter(node, elem);
        }
    }
    // ------------ End DOM Manipulation region -----------

    function search() {
        var searchVal, result, elements, i;
        if (elem && elem.value !== "") {
            searchVal = elem.value.toLowerCase();
            if (typeof source === "string") {
                callAjax(source + searchVal, function (response) {
                    result = JSON.parse(response);
                    drawAutocomplete(result);
                });
            } else {
                elements = [];
                for (i = 0; i < associatedArray.length; i += 1) {
                    if (associatedArray[i].indexOf(searchVal) > -1) {
                        if (associatedArray[i].startsWith(searchVal)) {
                            elements.push([source[i], 1]);
                        } else if (associatedArray[i].endsWith(searchVal)) {
                            elements.push([source[i], 3]);
                        } else {
                            elements.push([source[i], 2]);
                        }
                    }
                }
                elements.sort(function (a, b) {
                    if (a[1] < b[1]) {
                        return -1;
                    }
                    if (a[1] > b[1]) {
                        return 1;
                    }
                    return 0;
                });
                result = [];
                for (i = 0; i < elements.length; i += 1) {
                    result.push(elements[i][0]);
                }
                drawAutocomplete(result);
            }
        } else {
            removeElement($(".autocomplete"));
        }
    }

    function moveToAutocomplete(direction) {
        var autocompleteElem = $(".autocomplete"), currentAutocomplete, items, i;
        if (autocompleteElem) {
            currentAutocomplete = $(".highlighted_search");
            items = $$(".autocomplete li");
            if (currentAutocomplete) {
                removeClass(currentAutocomplete, "highlighted_search");
                // Find the index of the autocomplete element
                // so we can scroll to the next item properly
                for (i = 0; i < items.length; i += 1) {
                    if (items[i] === currentAutocomplete) {
                        break;
                    }
                }
                if (direction === "up") {
                    if (i === 0) {
                        i = items.length - 1;
                    } else {
                        i -= 1;
                    }
                    addClass(items[i], "highlighted_search");
                    items[0].parentNode.parentNode.scrollTop = items[i].offsetTop - 50;
                } else {
                    if (i >= items.length - 1) {
                        i = 0;
                    } else {
                        i += 1;
                    }
                    addClass(items[i], "highlighted_search");
                    items[0].parentNode.parentNode.scrollTop = items[i].offsetTop - 50;
                }
            } else {
                if (direction === "up") {
                    addClass(items[items.length - 1], "highlighted_search");
                    items[0].parentNode.parentNode.scrollTop = items[items.length - 1].offsetTop - 50;
                } else {
                    addClass(items[0], "highlighted_search");
                }
            }
        }
    }

    bindEvent(document, "click", function () {
        removeElement($(".autocomplete"));
    });

    bindEvent(elem, "keydown", function (event) {
        if (event.keyCode === 13) { // enter key
            event.preventDefault();
        } else if (event.keyCode === 40) { // down arrow
            event.preventDefault();
        } else if (event.keyCode === 38) { // up arrow
            event.preventDefault();
        } else if (event.keyCode === 9) { // tab key
            if ($(".autocomplete")) {
                event.preventDefault();
            }
        }
    });

    bindEvent(elem, "keyup", function (event) {
        if (event.keyCode === 13) { // enter key
            event.preventDefault();
            handleEnter();
        } else if (event.keyCode === 40) { // down arrow
            event.preventDefault();
            moveToAutocomplete("down");
        } else if (event.keyCode === 38) { // up arrow
            event.preventDefault();
            moveToAutocomplete("up");
        } else if (event.keyCode === 9) { // tab key
            if ($(".autocomplete")) {
                moveToAutocomplete("down");
                event.preventDefault();
            }
        } else if (event && event.target) {
            removeClass(elem, "slimFromPic");
            removeElement(elem.previousSibling);
            doOnDelay(search, 150);
        }
    });
}
