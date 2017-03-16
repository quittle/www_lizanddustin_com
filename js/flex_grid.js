// Copyright (c) 2017 Dustin Doloff
// Licensed under Apache License v2.0

goog.provide('FlexGrid');

const FlexGrid = class {
    /**
     * Basic constructor for flex grid
     * @param {!HTMLElement} root The root element the FledGrid lives in
     * @param {number} minWidthPx The minimum width for each item in the grid in pixels
     * @param {number} marginPx The spacing between items in the grid in pixels
     */
    constructor(root, minWidthPx, marginPx) {
        this._root = root;
        this._minWidthPx = minWidthPx;
        this._marginPx = marginPx;
    }
}
