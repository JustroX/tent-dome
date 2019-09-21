"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var Schema = /** @class */ (function () {
    function Schema(name) {
        this.schema = {};
        this.virtuals = {};
        this.config = {};
        this.name = name;
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
        this.config[key] = value;
    };
    Schema.prototype.get = function (key) {
        return this.config[key];
    };
    Schema.prototype.register = function () {
        this.mongooseSchema = new mongoose_1.Schema(this.schema, this.config);
        this.model = mongoose_1.model(this.name, this.mongooseSchema);
    };
    return Schema;
}());
exports.Schema = Schema;
