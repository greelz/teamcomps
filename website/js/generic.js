'use strict';
/*global document, window, XMLHttpRequest */
/*jslint bitwise: true */
var $ = function (selector) {
    return document.querySelector(selector);
};

var $$ = function (selector) {
    return document.querySelectorAll(selector);
};

function hasClass(elem, className) {
    if (elem) {
        return elem.className.split(' ').indexOf(className) > -1;
    }
}

function addClass(elem, newClass) {
    if (!hasClass(elem, newClass)) {
        elem.className += " " + newClass;
    }
}

function removeClass(elem, oldClass) {
    if (hasClass(elem, oldClass)) {
        elem.className = elem.className.replace(" " + oldClass, "");
    }
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function removeElement(elem) {
    if (elem) {
        elem.parentNode.removeChild(elem);
    }
}

function doOnDelay(callback, delay) {
    setTimeout(function () {
        callback();
    }, delay);
}

function callAjax(url, callback, interval) {
	console.log("opening " + url);
    if (window.XMLHttpRequest) {
        var oReq = new XMLHttpRequest();
        if (oReq.withCredentials === true) {
            oReq.open("GET", url, true);
            oReq.onload = function () {
                if (oReq.readyState === 4 && oReq.status === 200) {
                    if (interval) {
                        clearInterval(interval);
                    }
                    callback(oReq.responseText);
                }
            };
            oReq.send(null);
        } else {
            oReq.open("GET", url, true);
            oReq.onload = function () {
                if (oReq.readyState === 4 && oReq.status === 200) {
                    if (interval) {
                        clearInterval(interval);
                    }
                    callback(oReq.responseText);
                }
            };
            oReq.send(null);
        }
    }
}

// This fixes an issue where IE doesn't actually know what
// addEventListener means... we'll use .attachEvent instead
function bindEvent(el, eventName, eventHandler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, eventHandler, false);
    } else if (el.attachEvent) {
        el.attachEvent('on' + eventName, eventHandler);
    }
}

// Polyfills *****************
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        return this.substr(position || 0, searchString.length) === searchString;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchStr, position) {
        // This works much better than >= because
        // it compensates for NaN:
        if (!(position < this.length)) {
            position = this.length;
        } else {
            position |= 0; // round position
        }
        return this.substr(position - searchStr.length, searchStr.length) === searchStr;
    };
}
