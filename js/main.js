// Copyright (c) 2016-2017 Dustin Doloff
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
     * Empties the contents of the details container.
     */
    function clearDetailsContainer() {
        /** @type {?Element} */ const detailsContainerHeader =
                getRequiredElement('details-container-header');
        if (detailsContainerHeader) {
            emptyContents(detailsContainerHeader);
        }

        /** @type {?Element} */ const detailsContainerBody =
                getRequiredElement('details-container-body');
        if (detailsContainerBody) {
            emptyContents(detailsContainerBody);
        }
    }

    /**
     * Shows the details animation for a link.
     * @param {!Element} link The link for the section to inflate
     */
    function showDetail(link) {
        addClass(link, 'opened');
        addClass(getBody(), 'disable-scrolling');

        /** @type {?CSSStyleDeclaration} */ const linkStyle = getComputedStyle(link);
        /** @type {string} */ const color = linkStyle.getPropertyValue('background-color');
        /** @type {!ClientRect} */ const boundingRect = link.getBoundingClientRect();
        setTimeout(() => {
            /** @type {?Element} */ const detailsContainer =
                    getRequiredElement('details-container');
            /** @type {?Element} */ const detailsContainerHeader =
                    getRequiredElement('details-container-header');
            /** @type {?Element} */ const detailsContainerBody =
                    getRequiredElement('details-container-body');
            if (!(detailsContainer && detailsContainerHeader && detailsContainerBody)) {
                return;
            }

            clearDetailsContainer();

            detailsContainerHeader.innerHTML = link.innerHTML;
            detailsContainerHeader.removeChild(detailsContainer.querySelector('section'));

            detailsContainerBody.style.backgroundColor = color;
            detailsContainerBody.appendChild(document.importNode(link.querySelector('section'), true));
            // Temp
            //detailsContainerBody.style.display = 'none';

            detailsContainer.style.position = 'fixed';
            detailsContainer.style.top = boundingRect.top + 'px';
            detailsContainer.style.left = boundingRect.left + 'px';
            detailsContainer.style.width = boundingRect.width + 'px';
            detailsContainer.style.height = boundingRect.height + 'px';
            detailsContainerHeader.style.backgroundImage =
                    linkStyle.getPropertyValue('background-image');

            // let scaleX = boundingRect.width / (window.innerWidth * .8);
            // let scaleY = boundingRect.height / (window.innerHeight * .8);
            // let translateX = -window.innerWidth * .1 + boundingRect.left;
            // let translateY = -window.innerHeight * .1 + boundingRect.top;

            // detailsContainer.style.transform =
            //         `translateX(${translateX}px)
            //          translateY(${translateY}px)
            //          scaleX(${scaleX})
            //          scaleY(${scaleY})`;

            setTimeout(addClass.bind(null, getBody(), 'details-visible'), 1500);
        }, 1);
    }

    /**
     * Hides the detail section.
     */
    function hideDetail() {
        let openedLinks = document.querySelectorAll('.opened');
        for (let i = 0; i < openedLinks.length; i++) {
            removeClass(openedLinks[i], 'opened');
        }
        removeClass(getBody(), 'details-visible');
        removeClass(getBody(), 'disable-scrolling');

        setTimeout(clearDetailsContainer, 1500);
    }

    /**
     * Gets an id from a location hash string.
     * @param {!string} hash The hash string
     * @return {!string} The id of an element extracted from the hash
     */
    function getIdFromHash(hash) {
        return hash.replace(/^#?!?/, '')
    }

    /**
     * Callback for the onkeydown event.
     * @type {!EventListener} The keydown event.
     */
    function onKeyDown(e) {
        switch (e.keyCode) {
            case 27: // Escape
                location.hash = '#!';
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
            /** @type {!string} */ const id = getIdFromHash(location.hash)
            /** @type {?Element} */ const el = document.getElementById(id);
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
     * Callback for the onresize event.
     * @param {!Event} e The resize event
     */
    function onResize(e) {
        console.log('resize');
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

        //new FlexGrid(document.body, 100, 12);

        onHashChange();
    }

    window.addEventListener('load', init);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange, false);
    window.addEventListener('resize', onResize);
})();
