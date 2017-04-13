// Copyright (c) 2016-2017 Dustin Doloff
// Licensed under Apache License v2.0

(function() {
    'use strict';

    const API_ENDPOINT = 'https://api.lizanddustin.com';
    const RSVP_PATH = '/rsvp'

    function onRSVPSubmit() {
        /** @type {HTMLFormElement?} */ const form =
                /** @type {HTMLFormElement?} */
                        (document.querySelector('#details-container form#rsvp-form'));
        if (!form) {
            console.error('RSVP form not found');
            return
        }

        ajax(API_ENDPOINT + RSVP_PATH, 'POST', JSON.stringify(getFormData(form))).then(response => {
            console.log('Submitted: ' + response);
        }).catch(response => {
            console.error('Unable to submit request: ' + response);
        });
    }

    /**
     * Called when the RSVP details are shown
     */
    function onRSVPDetailShown() {
        if (!withAll(document.querySelector('#details-container select[name=contact-type]'),
                document.querySelector('#details-container input[name=contact-value]'),
                document.querySelector('#details-container form#rsvp-form'),
                document.querySelector('#details-container button[type=submit]'),
                (detailsContactType, detailsContactValue, form, submitButton) => {
                    detailsContactType.addEventListener('change', e => {
                        /** @type {!string} */ const value = detailsContactType.value;
                        /** @type {!string} */ let contactValuePattern;
                        switch (value) {
                            case 'email':
                                contactValuePattern = '^.+@.+$';
                                break;
                            case 'phone':
                                contactValuePattern = '^[\\(\\)+\\- \\d]+$';
                                break;
                            default:
                                console.error('Unknown contact type value: ' + value);
                                return;
                        }

                        detailsContactValue.setAttribute('pattern', contactValuePattern);
                    }, false);

                    form.addEventListener('submit', e => {
                        addClass(submitButton, 'sent');
                        onRSVPSubmit();
                        e.preventDefault();
                    });
                })
        ) {
            console.error('Unable to all necesary rsvp elements');
        }
    }

    /**
     * Called when a detail section is shown.
     */
    function onDetailShown() {
        switch (getIdFromHash(location.hash)) {
            case 'rsvp':
                onRSVPDetailShown();
                break;
        }
    }

    /**
     * Navigates to the home state and out of any views.
     */
    function navigateHome() {
        location.hash = '#!';
    }

    /**
     * Empties the contents of the details container.
     */
    function clearDetailsContainer() {
        /** @type {?Element} */ const detailsContainerContent =
                getRequiredElement('details-container-content');

        if (detailsContainerContent) {
            detailsContainerContent.scrollTop = 0;
        }

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
     * Gets the source element for a detail section
     * @param {!string} detailId The id of the detail section to show
     * @return {?Element} A copy of the detail source to use or null if not found.
     */
    function getDetailsSource(detailId) {
        /** @type {?Element} */ const link = document.getElementById(detailId);
        if (!link) {
            console.error('Unable to find element for detail section: ' + detailId);
            return null;
        }

        /** @type {?string} */ const sourceId = link.getAttribute('data-source');
        if (!sourceId) {
            console.error('data-source not found on: ' + detailId);
            return null;
        }

        /** @type {?Element} */ const source = document.getElementById(sourceId);
        if (!source) {
            console.error('Unable to get detail source element: ' + sourceId);
            return null;
        }

        return /** @type {?Element} */ (document.importNode(source, true));
    }

    /**
     * Shows the details animation for a link.
     * @param {!Element} link The link for the section to inflate
     */
    function showDetail(link) {
        //addClass(link, 'opened');
        addClass(getBody(), 'disable-scrolling');

        let flipSpin = false;

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
            /** @type {?Element} */ const copiedSource = getDetailsSource(link.getAttribute('id'));
            if (!(detailsContainer && detailsContainerHeader && detailsContainerBody && copiedSource)) {
                return;
            }

            clearDetailsContainer();

            detailsContainerHeader.innerHTML = link.innerHTML;
            //detailsContainerHeader.removeChild(detailsContainer.querySelector('section'));

            if (flipSpin) {
                detailsContainerBody.style.backgroundColor = color;
            }
            detailsContainerBody.appendChild(copiedSource);

            onDetailShown();
            // Temp
            //detailsContainerBody.style.display = 'none';

            if (flipSpin) {
                detailsContainer.style.position = 'fixed';
                detailsContainer.style.top = boundingRect.top + 'px';
                detailsContainer.style.left = boundingRect.left + 'px';
                detailsContainer.style.width = boundingRect.width + 'px';
                detailsContainer.style.height = boundingRect.height + 'px';
            }

            //detailsContainerHeader.style.backgroundImage =
            //        linkStyle.getPropertyValue('background-image');

            if (flipSpin) {
                let scaleX = boundingRect.width / (window.innerWidth * .8);
                let scaleY = boundingRect.height / (window.innerHeight * .8);
                let translateX = -window.innerWidth * .1 + boundingRect.left;
                translateX = boundingRect.left;
                let translateY = -window.innerHeight * .1 + boundingRect.top;

                detailsContainer.style.transform =
                        `translateX(${translateX}px)
                         translateY(${translateY}px)
                         scaleX(${scaleX})
                         scaleY(${scaleY})`;
            }

            setTimeout(addClass.bind(null, getBody(), 'details-visible'), flipSpin ? 1500 : 0);
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

        clearDetailsContainer();

        removeClass(getBody(), 'details-visible');
        removeClass(getBody(), 'disable-scrolling');

        // setTimeout(clearDetailsContainer, 1500);
    }

    /**
     * Gets an id from a location hash string.
     * @param {!string} hash The hash string
     * @return {!string} The id of an element extracted from the hash
     */
    function getIdFromHash(hash) {
        return hash.replace(/^#?!?/, '').split('&')[0]
    }

    /**
     * Callback for the onkeydown event.
     * @type {!EventListener} The keydown event.
     */
    function onKeyDown(e) {
        switch (e.keyCode) {
            case 27: // Escape
                navigateHome();
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
            /** @type {!string} */ const id = getIdFromHash(location.hash);
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

    /**
     * Callback for when the details container is clicked
     * @param {!Event} e The click event
     */
    function onDetailsContainerClick(e) {
        if (e.target.getAttribute('id') === 'details-container') {
            navigateHome();
        }
    }

    /**
     * Initializer event
     */
    function onDOMContentLoaded() {
        /** @type {?Element} */ const detailsContainer =
                getRequiredElement('details-container');
        if (detailsContainer) {
            detailsContainer.addEventListener('click', onDetailsContainerClick);
        }
    }

    window.addEventListener('load', init);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange, false);
    window.addEventListener('resize', onResize);
    registerOnDOMContentLoaded(onDOMContentLoaded);
})();
