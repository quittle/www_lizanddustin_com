// Copyright (c) 2016 Dustin Doloff
// Licensed under Apache License v2.0

(function() {
    'use strict';

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
     * Adjusts the nav bar offset.
     */
    function adjustNav() {
        if (!adjustNav.wasOnTop) {
            adjustNav.wasOnTop = true;
        }
    }

    /**
     * Shows the details animation for a link.
     * @param {!Element} link The link for the section to inflate
     */
    function showDetail(link) {
        /** @type {string} */ const color = getComputedStyle(link).getPropertyValue('background-color');
        /** @type {!ClientRect} */ const boundingRect = link.getBoundingClientRect();
        setTimeout(() => {
            let contents = document.createElement('div'); // Maybe this should be details?
            addClass(contents, 'detail-container');
            contents.style.backgroundColor = color;
            contents.appendChild(document.importNode(link.querySelector('section'), true));
            document.body.appendChild(contents);

            let scaleX = boundingRect.width / window.innerWidth * .8;
            let scaleY = boundingRect.height / window.innerHeight * .8;
            let translateX = -window.innerWidth * .1 + boundingRect.left;
            let translateY = -window.innerHeight * .1 + boundingRect.top;

            contents.style.transform =
                    `translateX(${translateX}px)
                     translateY(${translateY}px)
                     scaleX(${scaleX})
                     scaleY(${scaleY})`;

            setTimeout(addClass.bind(null, contents, 'visible'), 500);
        }, 500);
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
            });
        }

        window.addEventListener('hashchange', e => {
            /** @type {?Element} */ const el = document.getElementById(location.hash.substring(1));
            if (el) {
                showDetail(el);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, false);

    }

    window.addEventListener('scroll', function(e) {
        adjustNav();
    });

    window.addEventListener('resize', function(e) {
        adjustNav();
    });

    window.addEventListener('load', adjustNav);
    window.addEventListener('load', init);
    adjustNav();
})();
