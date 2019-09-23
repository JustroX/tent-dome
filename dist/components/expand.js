"use strict";
/**
* @module Expand
*/
exports.__esModule = true;
var Expand = /** @class */ (function () {
    function Expand() {
        /** Dictionary of populated fields */
        this.populate = {};
    }
    /** Set property of the model to be expandable
    * @param key name of the property
    * @param fields fields to be whitelisted when expanded.
    */
    Expand.prototype.add = function (key, fields) {
        this.populate[key] = fields;
    };
    /** Returns the populated dictionary*/
    Expand.prototype.expose = function () {
        return this.populate;
    };
    /** Returns whether a certain property is expandable
    * @param key name of the property
    */
    Expand.prototype.isExpandable = function (key) {
        if (this.populate[key])
            return true;
        return false;
    };
    return Expand;
}());
exports.Expand = Expand;
