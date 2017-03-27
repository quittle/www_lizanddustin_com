// Copyright (c) 2017 Dustin Doloff
// Licensed under Apache License v2.0

/**
 * Gets |document.body|, which should always be non-null.
 * @return {!HTMLBodyElement} The document body element.
 */
function getBody() {
    /** @type {?HTMLBodyElement} */ const body = document.body;
    if (!body) {
        console.error('document.body was null');
    }
    return  /** @type {!HTMLBodyElement} */ (body);
}

/**
 * Calculates the node offset from the top of the page.
 * @param {!Node} node The node to analyze
 * @return {!number} The offset from the top of the page in pixels.
 */
function offsetTop(node) {
    if (node) {
        return parseInt(node.offsetTop, 10) + offsetTop(node.offsetParent);
    } else {
        return 0;
    }
}

/**
 * Adds a class to an element.
 * @param {!Element} element The element to add the class to
 * @param {!string} className The class to add.
 */
function addClass(element, className) {
    if (element.classList) {
        element.classList.add(className);
    } else {
        var classString = element.getAttribute('class');
        var currentClasses = classString.split(' ');
        if (currentClasses.indexOf(className) == -1) {
            element.setAttribute('class', classString + ' ' + className);
        }
    }
}

/**
 * Removes a class from an element.
 * @param {!Element} element The element to remove the class from
 * @param {!string} className The class to remove.
 */
function removeClass(element, className) {
    if (element.classList) {
        element.classList.remove(className);
    } else {
        var currentClasses = element.getAttribute('class').split(' ');

        do {
            var index = currentClasses.indexOf(className);
            if (index != -1) {
                currentClasses.splice(index, 1);
            }
        } while (index != -1);

        element.setAttribute('class', currentClasses.join(' '));
    }
}

/**
 * Removes all the children of |el|
 * @param {!Element} el The element to remove
 */
function emptyContents(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

/**
 * Gets a required element.
 * @param {!string} id The id of the element to get
 * @return {?Element} The element if found or null if not found.
 */
function getRequiredElement(id) {
    /** @type {?Element} */ const element = document.getElementById(id);
    if (!element) {
        console.error('Unable to find required element: ' + id);
    }
    return element;
}

/**
 * Registers a callback to run when the DOM conetnt is loaded or run immediately if already loaded.
 * @param {!function()} callback The callback to register.
 */
function registerOnDOMContentLoaded(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

/**
 * Resets an elements scroll position.
 * @param {!Element} element The element the scroll state should be reset on
 */
function resetScroll(element) {
    //if ()
}
