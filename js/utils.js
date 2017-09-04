// Copyright (c) 2017 Dustin Doloff
// Licensed under Apache License v2.0

if (!window.console) {
    window.console = /** @type {!Console} */ ({
        log: () => {},
        error: () => {},
    });
}

/**
 * @param {...*} args_ The args to check
 * The last parameter should be a function that takes all the previous arguments when all are
 * non-null, non-undefined.
 * @return {boolean} True if func was called, otherwise false.
 */
function withAll(args_) {
    const args = [];
    for (let i = 0; i < arguments.length - 1; i++) {
        let value = arguments[i];
        if (typeof value === 'undefined' || value === null) {
            return false;
        }
        args.push(value);
    }
    /** @type {function(...)} */ const func = arguments[arguments.length - 1];
    func.apply(null, args);
    return true;
}

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
        if (!classString) {
            element.setAttribute('class', className);
        } else {
            var currentClasses = classString.split(' ');
            if (currentClasses.indexOf(className) == -1) {
                element.setAttribute('class', classString + ' ' + className);
            }
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
        var currentClasses = element.getAttribute('class');
        if (!currentClasses) {
            return;
        }
        currentClasses = currentClasses.split(' ');

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
 * Initiates an AJAX request.
 * @param {!string} url The url to submit
 * @param {!string=} method The HTTP verb to send as
 * @param {!string=} data The data to put in the request
 * @return {!Promise<!string>} A Promise that will resolve/reject if the request succeeds/fails,
 *                            passing in the response data.
 */
function ajax(url, method = ajax.HTTP_METHOD.GET, data = '') {
    const xhr = new XMLHttpRequest();

    const ret = new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
            console.log(xhr.readyState + ' ' + xhr.status);
            if (xhr.readyState < 4) {
                return;
            }

            if (200 <= xhr.status && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(xhr.responseText);
            }
        };
    });

    xhr.open(method, url, true);
    xhr.send(data);
    return ret;
}
ajax.HTTP_METHOD = {
    'GET': 'GET',
    'POST': 'POST',
};

/**
 * Converts a NodeList to an Array.
 * @param {!NodeList} nodeList The NodeList to convert
 * @return {!Array<!Element>} An array of the elements in nodeList.
 */
function nodeListToArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
}

/**
 * Gets the data from a form as an object.
 * @param {!HTMLFormElement} form The form to extract from
 * @return {!Object<!string, !string>} An object representing the name/value pairs in the form.
 */
function getFormData(form) {
    /** @type {!Array<!HTMLElement>} */ const inputs = /** @type {!Array<!HTMLElement>} */ (
            nodeListToArray(form.querySelectorAll('input')).concat(
            nodeListToArray(form.querySelectorAll('select'))).concat(
            nodeListToArray(form.querySelectorAll('textarea'))));

    const ret = {};
    inputs.forEach(element => {
        /** @type {string?} */ const name = element.getAttribute('name');
        /** @type {string?} */ const value = element.value;
        if (!(name && value)) {
            return;
        }

        ret[name] = value;
    });
    return ret;
}

/**
 * Removes an inline style
 * @param {!HTMLElement} element The element to modify
 * @param {!string} property The style to remove
 * @suppress {invalidCasts}
 */
function removeInlineStyle(element, property) {
    /** @type {!CSSStyleDeclaration} */ const style = element.style;
    if (style.removeProperty) {
        style.removeProperty(property);
    } else if (style.removeAttribute) {
        style.removeAttribute(property);
    } else {
        style[property] = /** @type {string} */ (undefined);
    }
}

/**
 * Force the browser to re-render and therefore redraw the page to fix potential glitches
 */
function forceRedraw() {
    /** @type {!HTMLBodyElement} */ const body = getBody();
    /** @type {string?} */ const prevDisplay = body.style.display;
    if (prevDisplay === 'block') {
        body.style.display = 'flex';
    } else {
        body.style.display = 'block';
    }

    if (prevDisplay) {
        body.style.display = prevDisplay;
    } else {
        removeInlineStyle(body, 'display');
    }
}
