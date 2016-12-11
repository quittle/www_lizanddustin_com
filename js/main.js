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
        /*
        //var wrapper = document.getElementById('wrapper');
        //var names = document.getElementById('title-text-names');
        var offset = 0; //offsetTop(names); //200;
        console.log(offset);
        if (window.pageYOffset > offset) {
            //wrapper.setAttribute('class', 'scrolled');
            if (adjustNav.wasOnTop) {
                //location.hash = 'our-story';
            }
        } else {
            //wrapper.setAttribute('class', '');
        }
        */
    }

    /**
     * Shows the details animation for a link.
     * @param {!Element} link The link for the section to inflate
     */
    function showDetail(link) {
        //console.log(link);
        /** @type {string} */ const color = getComputedStyle(link).getPropertyValue('background-color');
        /** @type {!HTMLCanvasElement} */ const canvas = /** @type {!HTMLCanvasElement} */ (document.createElement('canvas'));
        canvas.style.position = 'fixed';
        canvas.style.top = 0;
        canvas.style.left = 0;
//        canvas.style.width = window.innerWidth;
//        canvas.style.height = window.innerHeight;
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);
        document.body.appendChild(canvas);

        /** @type {!CanvasRenderingContext2D} */ const ctx = /** @type {!CanvasRenderingContext2D} */ (canvas.getContext('2d'));
        ctx.fillStyle = color;
        const interval = 20;
        const animationTime = 500;
        let duration = 0;

        setTimeout(() => {
            /** @type {!ClientRect} */ const boundingRect = link.getBoundingClientRect();
            link.getBoundingClientRect();
            console.log(boundingRect);

            /** @type {!number} */ const intervalTimer = setInterval(() => {
                //let ratioComplete = duration / animationTime;
                /*
                let top = boundingRect.top * (1 - ratioComplete);
                let left = boundingRect.left * (1 - ratioComplete);
                let width = boundingRect.width + (parseInt(window.innerWidth, 10) - boundingRect.width) * (ratioComplete);
                let height = boundingRect.height + (parseInt(window.innerHeight, 10) - boundingRect.height) * (ratioComplete);
                //ctx.fillRect(left, top, width, height);
                console.log(top + left + width + height);*/
                ctx.clearRect(boundingRect.left, boundingRect.top, boundingRect.width, boundingRect.height);

                duration += interval;
                if (duration >= animationTime) {
                    canvas.parentNode.removeChild(canvas);
                    clearTimeout(intervalTimer);
                }
            }, interval);

            let contents = document.createElement('div'); // Maybe details?
            contents.classList.add('detail-container');
            contents.style.backgroundColor = color;
            contents.appendChild(document.importNode(link.querySelector('section'), true));
            document.body.appendChild(contents);

            let scaleX = boundingRect.width / window.innerWidth * .8;
            let scaleY = boundingRect.height / window.innerHeight * .8;
            let translateX = -window.innerWidth * .1 + boundingRect.left;
            let translateY = -window.innerHeight * .1 + boundingRect.top;

            contents.style.transform = `translateX(${translateX}px) translateY(${translateY}px) scaleX(${scaleX}) scaleY(${scaleY})`;
            setTimeout(() => {
                contents.classList.add('visible');
            }, 500);
        }, 500);
    }

    /**
     * Initializer method
     */
    function init() {/*
        const sections = document.getElementsByTagName('section');
        for(var i = 0; i < sections.length; i++) {
            const section = sections[i];
            section.addEventListener('click', function(e) {
                for (var i = 0; i < sections.length; i++) {
                    removeClass(sections[i], 'focused');
                }

                addClass(e.target, 'focused');
            });
        }*/

        /** @type {!NodeList} */ const navLinks = document.body.querySelectorAll('main > a');
        for (let i = 0; i < navLinks.length; i++) {
            /** @type {!Node} */ const navLink = navLinks[i];
            navLink.addEventListener('click', e => {
                const target = /** @type {!HTMLAnchorElement} */ (e.currentTarget);
                // Prevent scrolling while preserving fragment change
                //e.preventDefault();
                if(history.pushState) {
                    history.pushState(null, '', target.getAttribute('href'));
                } else {
                    location.hash = target.getAttribute('href');
                }

                showDetail(target);
                //e.preventDefault();
                //e.stopPropagation();
                //return false;
            });
        }

        window.addEventListener('hashchange', e => {
            //const target = /** @type {!HTMLAnchorElement} */ (e.currentTarget);
                // Prevent scrolling while preserving fragment change
                //e.preventDefault();
                //location.hash = target.getAttribute('href') + 'zzz';

            /** @type {?Element} */ const el = document.getElementById(location.hash.substring(1));
            console.log(el);
            if (el) {
                showDetail(el);
            }
            console.log('hash change');
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
