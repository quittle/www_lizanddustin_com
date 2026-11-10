if (!window.console) {
    window.console = {
        log: () => {},
        error: () => {},
    } as unknown as Console;
}

/**
 * Calls `func` with the preceding arguments when all of them are
 * non-null and non-undefined.
 * @return True if func was called, otherwise false.
 */
export function withAll<T extends unknown[]>(
    ...args: [...T, (...args: { [K in keyof T]: NonNullable<T[K]> }) => void]
): boolean {
    const values = args.slice(0, -1);
    for (const value of values) {
        if (typeof value === 'undefined' || value === null) {
            return false;
        }
    }
    const func = args[args.length - 1] as unknown as (...args: unknown[]) => void;
    func.apply(null, values);
    return true;
}

/**
 * Adds a class to an element.
 * @param element The element to add the class to
 * @param className The class to add.
 */
export function addClass(element: Element, className: string): void {
    if (element.classList) {
        element.classList.add(className);
    } else {
        const classString = element.getAttribute('class');
        if (!classString) {
            element.setAttribute('class', className);
        } else {
            const currentClasses = classString.split(' ');
            if (currentClasses.indexOf(className) == -1) {
                element.setAttribute('class', classString + ' ' + className);
            }
        }
    }
}

/**
 * Removes a class from an element.
 * @param element The element to remove the class from
 * @param className The class to remove.
 */
export function removeClass(element: Element, className: string): void {
    if (element.classList) {
        element.classList.remove(className);
    } else {
        const classAttr = element.getAttribute('class');
        if (!classAttr) {
            return;
        }
        const currentClasses = classAttr.split(' ');

        let index: number;
        do {
            index = currentClasses.indexOf(className);
            if (index != -1) {
                currentClasses.splice(index, 1);
            }
        } while (index != -1);

        element.setAttribute('class', currentClasses.join(' '));
    }
}

/**
 * Gets a required element.
 * @param id The id of the element to get
 * @return The element if found or null if not found.
 */
export function getRequiredElement(id: string): HTMLElement | null {
    const element = document.getElementById(id);
    if (!element) {
        console.error('Unable to find required element: ' + id);
    }
    return element;
}

/**
 * Initiates an AJAX request.
 * @param url The url to submit
 * @param method The HTTP verb to send as
 * @param data The data to put in the request
 * @return A Promise that will resolve/reject if the request succeeds/fails,
 *         passing in the response data.
 */
export function ajax(url: string, method: string = 'GET', data = ''): Promise<string> {
    const xhr = new XMLHttpRequest();

    const ret = new Promise<string>((resolve, reject) => {
        xhr.onreadystatechange = () => {
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

/**
 * Gets the data from a form as an object.
 * @param form The form to extract from
 * @return An object representing the name/value pairs in the form.
 */
export function getFormData(form: HTMLFormElement): Record<string, string> {
    const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');

    const ret: Record<string, string> = {};
    inputs.forEach(element => {
        const name = element.getAttribute('name');
        const value = element.value;
        if (!(name && value)) {
            return;
        }

        ret[name] = value;
    });
    return ret;
}

/**
 * Removes an inline style
 * @param element The element to modify
 * @param property The style to remove
 */
export function removeInlineStyle(element: HTMLElement, property: string): void {
    const style = element.style as CSSStyleDeclaration & {
        removeAttribute?: (name: string) => boolean;
    };
    if (style.removeProperty) {
        style.removeProperty(property);
    } else if (style.removeAttribute) {
        style.removeAttribute(property);
    } else {
        (style as unknown as Record<string, unknown>)[property] = undefined;
    }
}

/**
 * Force the browser to re-render and therefore redraw the page to fix potential glitches
 */
export function forceRedraw(): void {
    const body = document.body;
    const prevDisplay = body.style.display;
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
