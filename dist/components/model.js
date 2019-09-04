"use strict";
exports.__esModule = true;
var schema_1 = require("./schema");
var method_1 = require("./method");
var Model = /** @class */ (function () {
    function Model() {
        this.Schema = new schema_1.Schema(this);
        this.Method = new method_1.Method();
    }
    Model.prototype.register = function () {
        this.Schema.register();
        this.Method.register();
    };
    return Model;
}());
exports.Model = Model;
;
