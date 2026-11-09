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

export function getBody(): HTMLBodyElement {
    const body = document.body as HTMLBodyElement | null;
    if (!body) {
        console.error('document.body was null');
    }
    return body as HTMLBodyElement;
}

export function addClass(element: Element, className: string): void {
    element.classList.add(className);
}

export function removeClass(element: Element, className: string): void {
    element.classList.remove(className);
}

export function emptyContents(el: Element): void {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

// Returns null (and logs) when the element is missing.
export function getRequiredElement(id: string): HTMLElement | null {
    const element = document.getElementById(id);
    if (!element) {
        console.error('Unable to find required element: ' + id);
    }
    return element;
}

export function registerOnDOMContentLoaded(callback: () => void): void {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// Resolves with the response text on 2xx, rejects otherwise.
export function ajax(url: string, method: string = ajax.HTTP_METHOD.GET, data = ''): Promise<string> {
    const xhr = new XMLHttpRequest();

    const ret = new Promise<string>((resolve, reject) => {
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

export namespace ajax {
    export const HTTP_METHOD = {
        GET: 'GET',
        POST: 'POST',
    } as const;
}

export function nodeListToArray<T extends Node>(nodeList: NodeListOf<T>): T[] {
    return Array.prototype.slice.call(nodeList) as T[];
}

export function getFormData(form: HTMLFormElement): Record<string, string> {
    const inputs: Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = [
        ...nodeListToArray(form.querySelectorAll('input')),
        ...nodeListToArray(form.querySelectorAll('select')),
        ...nodeListToArray(form.querySelectorAll('textarea')),
    ];

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

// Forces a re-render to fix potential glitches.
export function forceRedraw(): void {
    const body = getBody();
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
