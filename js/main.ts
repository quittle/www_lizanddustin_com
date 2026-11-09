import {
    addClass,
    ajax,
    emptyContents,
    forceRedraw,
    getBody,
    getFormData,
    getRequiredElement,
    registerOnDOMContentLoaded,
    removeClass,
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

        ajax(API_ENDPOINT + RSVP_PATH, ajax.HTTP_METHOD.POST, JSON.stringify(getFormData(form))).then(response => {
            console.log(response);
            if (submit) {
                addClass(submit, 'sent');
            }
            showDetail('Thank You!', null);
        }).catch(response => {
            if (submit) {
                removeClass(submit, 'sending');
                removeClass(submit, 'sent');
                submit.blur();
            }
        });
    }

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
                        addClass(submitButton, 'sending');
                        onRSVPSubmit();
                        e.preventDefault();
                    });
                })
        ) {
            console.error('Unable to all necessary rsvp elements');
        }
    }

    function onDetailShown(): void {
        switch (getIdFromHash(location.hash)) {
            case 'rsvp':
                onRSVPDetailShown();
                break;
        }
    }

    function navigateHome(): void {
        location.hash = '';
        if (typeof history.pushState === 'function') {
            history.replaceState('', document.title, location.pathname + location.search);
        }
    }

    function clearDetailsContainer(): void {
        const detailsContainerContent = getRequiredElement('details-container-content');

        if (detailsContainerContent) {
            detailsContainerContent.scrollTop = 0;
        }

        const detailsContainerHeader = getRequiredElement('details-container-header');

        if (detailsContainerHeader) {
            emptyContents(detailsContainerHeader);
        }

        const detailsContainerBody = getRequiredElement('details-container-body');
        if (detailsContainerBody) {
            emptyContents(detailsContainerBody);
        }
    }

    function getDetailsSource(detailId: string): HTMLElement | null {
        const link = document.getElementById(detailId);
        if (!link) {
            console.error('Unable to find element for detail section: ' + detailId);
            return null;
        }

        const sourceId: string | null = link.getAttribute('data-source') ||
                'details-source-' + link.getAttribute('id');
        if (!sourceId) {
            console.error('data-source not found on: ' + detailId);
            return null;
        }

        const source = document.getElementById(sourceId);
        if (!source) {
            console.error('Unable to get detail source element: ' + sourceId);
            return null;
        }

        return document.importNode(source, true);
    }

    function showDetailForLink(link: Element): void {
        const body = getDetailsSource(link.getAttribute('id') ?? '');
        if (body) {
            showDetail(link.innerHTML, body);
        }
    }

    function showDetail(header: string, body: HTMLElement | null): void {
        addClass(getBody(), 'disable-scrolling');

        withAll(getRequiredElement('details-container-header'),
                getRequiredElement('details-container-body'),
                (detailsContainerHeader, detailsContainerBody) => {
                    clearDetailsContainer();

                    detailsContainerHeader.innerHTML = header;

                    if (body) {
                        detailsContainerBody.appendChild(body);
                    }

                    onDetailShown();

                    addClass(getBody(), 'details-visible');
                }
        );
    }

    function hideDetail(): void {
        clearDetailsContainer();

        removeClass(getBody(), 'details-visible');
        removeClass(getBody(), 'disable-scrolling');
    }

    function getIdFromHash(hash: string): string {
        return hash.replace(/^#?!?/, '').split('&')[0];
    }

    function onKeyDown(e: KeyboardEvent): void {
        switch (e.keyCode) {
            case 27: // Escape
                navigateHome();
                break;
        }
    }

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

    function init(): void {
        const navLinks = document.body.querySelectorAll('main > a');
        for (let i = 0; i < navLinks.length; i++) {
            const navLink = navLinks[i];
            navLink.addEventListener('click', e => {
                const target = e.currentTarget as HTMLAnchorElement;
                if (typeof history.pushState === 'function') {
                    history.pushState(null, '', target.getAttribute('href'));
                } else {
                    location.hash = target.getAttribute('href') ?? '';
                }

                showDetailForLink(target);
            });
        }

        onHashChange();
    }

    function onDetailsContainerClick(e: MouseEvent): void {
        if (e.target instanceof Element && e.target.getAttribute('id') === 'details-container') {
            navigateHome();
        }
    }

    function onDOMContentLoaded(): void {
        const detailsContainer = getRequiredElement('details-container');
        if (detailsContainer) {
            detailsContainer.addEventListener('click', onDetailsContainerClick);
        }
    }

    window.addEventListener('load', init);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange, false);
    registerOnDOMContentLoaded(onDOMContentLoaded);
})();
