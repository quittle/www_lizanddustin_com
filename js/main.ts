import '../css/main.scss';
import {
    ajax,
    forceRedraw,
    getFormData,
    getRequiredElement,
    withAll,
} from './utils.js';

(function() {
    'use strict';

    const API_ENDPOINT = 'https://api.lizanddustin.com';
    const RSVP_PATH = '/rsvp';

    function onRSVPSubmit(): void {
        const form = document.querySelector<HTMLFormElement>('#details-container form#rsvp-form');
        if (!form) {
            console.error('RSVP form not found');
            return;
        }

        const submit = form.querySelector<HTMLButtonElement>('button[type=submit]');
        if (!submit) {
            console.error('Unable to find submit button');
        }

        ajax(API_ENDPOINT + RSVP_PATH, 'POST', JSON.stringify(getFormData(form))).then(response => {
            if (submit) {
                submit.classList.add('sent');
            }
            showDetail('Thank You!', null);
        }).catch(response => {
            if (submit) {
                submit.classList.remove('sending');
                submit.classList.remove('sent');
                submit.blur();
            }
        });
    }

    /**
     * Called when the RSVP details are shown
     */
    function onRSVPDetailShown(): void {
        if (!withAll(document.querySelector<HTMLSelectElement>('#details-container select[name=contact-type]'),
                document.querySelector<HTMLInputElement>('#details-container input[name=contact-value]'),
                document.querySelector<HTMLFormElement>('#details-container form#rsvp-form'),
                document.querySelector<HTMLButtonElement>('#details-container button[type=submit]'),
                (detailsContactType, detailsContactValue, form, submitButton) => {
                    detailsContactType.addEventListener('change', e => {
                        const value: string = detailsContactType.value;
                        let contactValuePattern: string;
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
                        submitButton.classList.add('sending');
                        onRSVPSubmit();
                        e.preventDefault();
                    });
                })
        ) {
            console.error('Unable to all necessary rsvp elements');
        }
    }

    /**
     * Called when a detail section is shown.
     */
    function onDetailShown(): void {
        switch (getIdFromHash(location.hash)) {
            case 'rsvp':
                onRSVPDetailShown();
                break;
        }
    }

    /**
     * Navigates to the home state and out of any views.
     */
    function navigateHome(): void {
        location.hash = '';
        history.replaceState('', document.title, location.pathname + location.search);
    }

    /**
     * Empties the contents of the details container.
     */
    function clearDetailsContainer(): void {
        const detailsContainerContent = getRequiredElement('details-container-content');

        if (detailsContainerContent) {
            detailsContainerContent.scrollTop = 0;
        }

        const detailsContainerHeader = getRequiredElement('details-container-header');

        if (detailsContainerHeader) {
            detailsContainerHeader.replaceChildren();
        }

        const detailsContainerBody = getRequiredElement('details-container-body');
        if (detailsContainerBody) {
            detailsContainerBody.replaceChildren();
        }
    }

    /**
     * Gets the source element for a detail section
     * @param detailId The id of the detail section to show
     * @return A copy of the detail source to use or null if not found.
     */
    function getDetailsSource(detailId: string): HTMLElement | null {
        const link = document.getElementById(detailId);
        if (!link) {
            console.error('Unable to find element for detail section: ' + detailId);
            return null;
        }

        const sourceId: string = link.getAttribute('data-source') ||
                'details-source-' + link.getAttribute('id');

        const source = document.getElementById(sourceId);
        if (!source) {
            console.error('Unable to get detail source element: ' + sourceId);
            return null;
        }

        return document.importNode(source, true);
    }

    /**
     * Shows the details animation for a link.
     * @param link The link for the section to inflate
     */
    function showDetailForLink(link: Element): void {
        const body = getDetailsSource(link.getAttribute('id') ?? '');
        if (body) {
            showDetail(link.innerHTML, body);
        }
    }

    /**
     * Shows a detail section
     * @param header The header text
     * @param body The body of the detail
     */
    function showDetail(header: string, body: HTMLElement | null): void {
        document.body.classList.add('disable-scrolling');

        withAll(getRequiredElement('details-container-header'),
                getRequiredElement('details-container-body'),
                (detailsContainerHeader, detailsContainerBody) => {
                    clearDetailsContainer();

                    detailsContainerHeader.innerHTML = header;

                    if (body) {
                        detailsContainerBody.appendChild(body);
                    }

                    onDetailShown();

                    document.body.classList.add('details-visible');
                }
        );
    }

    /**
     * Hides the detail section.
     */
    function hideDetail(): void {
        clearDetailsContainer();

        document.body.classList.remove('details-visible');
        document.body.classList.remove('disable-scrolling');
    }

    /**
     * Gets an id from a location hash string.
     * @param hash The hash string
     * @return The id of an element extracted from the hash
     */
    function getIdFromHash(hash: string): string {
        return hash.replace(/^#?!?/, '').split('&')[0];
    }

    /**
     * Callback for the onkeydown event.
     */
    function onKeyDown(e: KeyboardEvent): void {
        switch (e.keyCode) {
            case 27: // Escape
                navigateHome();
                break;
        }
    }

    /**
     * Callback for the hashchange event.
     * @param opt_e The hashchange event
     * @return the return value for the hashchange event if |opt_e| is defined.
     */
    function onHashChange(opt_e?: HashChangeEvent): boolean | undefined {
        if (!location.hash || location.hash.length < 2) {
            hideDetail();
        } else {
            const id: string = getIdFromHash(location.hash);
            const el = document.getElementById(id);
            if (el) {
                showDetailForLink(el);
            } else {
                hideDetail();
            }
        }

        forceRedraw();

        if (opt_e) {
            opt_e.preventDefault();
            return false;
        }
    }

    /**
     * Initializer method
     */
    function init(): void {
        const navLinks = document.body.querySelectorAll('main > a');
        for (let i = 0; i < navLinks.length; i++) {
            const navLink = navLinks[i];
            navLink.addEventListener('click', e => {
                const target = e.currentTarget as HTMLAnchorElement;
                history.pushState(null, '', target.getAttribute('href'));

                showDetailForLink(target);
            });
        }

        onHashChange();
    }

    /**
     * Callback for when the details container is clicked
     */
    function onDetailsContainerClick(e: MouseEvent): void {
        if (e.target instanceof Element && e.target.getAttribute('id') === 'details-container') {
            navigateHome();
        }
    }

    /**
     * Initializer event
     */
    function onDOMContentLoaded(): void {
        const detailsContainer = getRequiredElement('details-container');
        if (detailsContainer) {
            detailsContainer.addEventListener('click', onDetailsContainerClick);
        }
    }

    window.addEventListener('load', init);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange, false);
    onDOMContentLoaded();
})();
