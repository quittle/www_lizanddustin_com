// Copyright (c) 2016 Dustin Doloff
// Licensed under Apache License v2.0

(function() {
    'use strict';

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
     * @param {!HTMLElement} element The element to add the class to
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
     * @param {!HTMLElement} element The element to remove the class from
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
     * Shows the details animation for a link.
     * @param {!Element} link The link for the section to inflate
     */
    function showDetail(link) {
        addClass(getBody(), 'disable-scrolling');

        /** @type {string} */ const color = getComputedStyle(link).getPropertyValue('background-color');
        /** @type {!ClientRect} */ const boundingRect = link.getBoundingClientRect();
        setTimeout(() => {
            /** @type {?Element} */ const detailsContainer = getRequiredElement('details-container');
            if (!detailsContainer) {
                return;
            }
            detailsContainer.style.backgroundColor = color;
            emptyContents(detailsContainer);
            detailsContainer.appendChild(document.importNode(link.querySelector('section'), true));

            let scaleX = boundingRect.width / window.innerWidth * .8;
            let scaleY = boundingRect.height / window.innerHeight * .8;
            let translateX = -window.innerWidth * .1 + boundingRect.left;
            let translateY = -window.innerHeight * .1 + boundingRect.top;

            detailsContainer.style.transform =
                    `translateX(${translateX}px)
                     translateY(${translateY}px)
                     scaleX(${scaleX})
                     scaleY(${scaleY})`;

            setTimeout(addClass.bind(null, getBody(), 'details-visible'), 150);
        }, 1);
    }

    /**
     * Hides the detail section.
     */
    function hideDetail() {
        removeClass(getBody(), 'details-visible');
        removeClass(getBody(), 'disable-scrolling');

        setTimeout(() => {
            /** @type {?Element} */ const detailsContainer = getRequiredElement('details-container');
            if (!detailsContainer) {
                return;
            }
            emptyContents(detailsContainer);
        }, 150);

    }

    /**
     * Callback for the onkeydown event.
     * @type {!EventListener}
     */
    function onKeyDown(e) {
        switch (e.keyCode) {
            case 27: // Escape
                location.hash = '';
                break;
        }
    }

    /**
     * Callback for the hashchange event.
     * @param {!Event=} opt_e The hashchange event
     */
    function onHashChange(opt_e) {
        if (!location.hash || location.hash.length < 2) {
            hideDetail();
        } else {
            /** @type {?Element} */ const el = document.getElementById(location.hash.substring(1));
            if (el) {
                showDetail(el);
            } else {
                hideDetail();
            }
        }

        if (opt_e) {
            opt_e.preventDefault();
            return false;
        }
    }

    /**
     * Initializer method
     */
    function init() {
        /** @type {!NodeList} */ const navLinks = document.body.querySelectorAll('main > a');
        for (let i = 0; i < navLinks.length; i++) {
            /** @type {!Node} */ const navLink = navLinks[i];
            navLink.addEventListener('click', e => {
                const target = /** @type {!HTMLAnchorElement} */ (e.currentTarget);
                if(history.pushState) {
                    history.pushState(null, '', target.getAttribute('href'));
                } else {
                    location.hash = target.getAttribute('href');
                }

                showDetail(target);
                //e.preventDefault();
            });
        }

        onHashChange();
    }

    window.addEventListener('load', init);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange, false);
})();
