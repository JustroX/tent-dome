"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
;
;
var Schema = /** @class */ (function () {
    function Schema(parent) {
        this.virtuals = {};
        this.config = {};
        this.parent = parent;
    }
    Schema.prototype.define = function (schema, config) {
        this.schema = schema;
        if (config)
            for (var i in config)
                this.set(i, config[i]);
    };
    Schema.prototype.virtual = function (key, virtual) {
        this.virtuals[key] = virtual;
    };
    Schema.prototype.set = function (key, value) {
        var BLACKLIST = ["define", "virtual", "set", "get", "register"];
        if (BLACKLIST.indexOf(key) >= 0)
            throw "Can not set " + key + ", " + key + " is a reserved keyword.";
        this.config[key] = value;
    };
    Schema.prototype.get = function (key) {
        return this.config[key];
    };
    Schema.prototype.register = function () {
        this.mongooseSchema = new mongoose_1.Schema(this.schema, this.config);
    };
    return Schema;
}());
exports.Schema = Schema;
;
