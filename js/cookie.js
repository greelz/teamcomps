function setCookie(key, value) {
    document.cookie = key + "=" + value + ";expires=Fri, 31 Dec 9999 23:59:59 GMT"
}

function removeCookie(key) {
    document.cookie = key + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

// Returns a key's value, or null
function getCookie(key) {
    if (key && key.length > 0) {
        var cookies = document.cookie.split("; ");
        var len = key.length;
        for (var i = 0; i < cookies.length; ++i) {
            if (cookies[i].substr(0, len) === key) {
                return cookies[i].substr(len + 1);
            }
        }
    }
    return null;
}