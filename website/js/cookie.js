'use strict';
/*global document */
function setCookie(key, value) {
    document.cookie = key + "=" + value + ";expires=Fri, 31 Dec 9999 23:59:59 GMT";
}

function removeCookie(key) {
    document.cookie = key + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

// Returns a key's value, or null
function getCookie(key) {
    var cookies, len, i;
    if (key && key.length > 0) {
        cookies = document.cookie.split("; ");
        len = key.length;
        for (i = 0; i < cookies.length; i += 1) {
            if (cookies[i].substr(0, len) === key) {
                return cookies[i].substr(len + 1);
            }
        }
    }
    return null;
}
