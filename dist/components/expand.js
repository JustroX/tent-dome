"use strict";
exports.__esModule = true;
var Expand = /** @class */ (function () {
    function Expand() {
        this.populate = {};
    }
    Expand.prototype.add = function (key, fields) {
        this.populate[key] = fields;
    };
    Expand.prototype.expose = function () {
        return this.populate;
    };
    Expand.prototype.isExpandable = function (key) {
        if (this.populate[key])
            return true;
        return false;
    };
    return Expand;
}());
exports.Expand = Expand;
