// Copyright (c) 2016 Dustin Doloff
// Licensed under Apache License v2.0

'strict mode';

function offsetTop(el) {
    if (el) {
        return parseInt(el.offsetTop, 10) + offsetTop(el.offsetParent);
    } else {
        return 0;
    }
}

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

function adjustNav() {
    if (!adjustNav.wasOnTop) {
        adjustNav.wasOnTop = true;
    }
    var wrapper = document.getElementById('wrapper');
    var names = document.getElementById('title-text-names');
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
}

function init() {
    var sections = document.getElementsByTagName('section');
    for(var i = 0; i < sections.length; i++) {
        var section = sections[i];
        section.addEventListener('click', function(e) {
            for (var i = 0; i < sections.length; i++) {
                removeClass(sections[i], 'focused');
            }

            addClass(e.target, 'focused');
        });
    }
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