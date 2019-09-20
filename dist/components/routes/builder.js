"use strict";
exports.__esModule = true;
var Middlewares = require("./middlewares");
var Assert = require("assert");
exports.BUILT_IN_FACTORIES = [
    "model",
    "create",
    "save",
    "read",
    "remove",
    "assign",
    "sanitize",
    "param",
    "list",
    "success",
    "show",
    "present" // return list
];
var Builder = /** @class */ (function () {
    function Builder(name, options) {
        if (options === void 0) { options = {
            "import builtin": true
        }; }
        this.middlewares = [];
        this.head = 0;
        this.name = "";
        //Builtin functions
        this.model = null;
        this.create = null;
        this.save = null;
        this.read = null;
        this.remove = null;
        this.assign = null;
        this.sanitize = null;
        this.param = null;
        this.list = null;
        this.success = null;
        this.show = null;
        this.present = null;
        this.name = name;
        if (options["import builtin"])
            this.importBuiltIn();
    }
    Builder.prototype.custom = function (mw) {
        this.middlewares.splice(this.head, 0, mw);
        this.head++;
        return this;
    };
    Builder.prototype.pointHead = function (index) {
        Assert(index >= 0 && index < this.middlewares.length, "Head index out of range");
        this.head = index;
        return this;
    };
    Builder.prototype.lookHead = function () {
        return this.middlewares[this.head];
    };
    Builder.prototype.prevHead = function () {
        this.pointHead(this.head - 1);
        return this;
    };
    Builder.prototype.nextHead = function () {
        this.pointHead(this.head + 1);
        return this;
    };
    Builder.prototype.importBuiltIn = function () {
        for (var _i = 0, BUILT_IN_FACTORIES_1 = exports.BUILT_IN_FACTORIES; _i < BUILT_IN_FACTORIES_1.length; _i++) {
            var mw = BUILT_IN_FACTORIES_1[_i];
            this.define(mw, Middlewares[mw](this.name));
        }
    };
    Builder.prototype.define = function (name, mw) {
        Assert(!this[name], "Builder pipe is already defined");
        var _this = this;
        this[name] = function () {
            this.middlewares.splice(this.head, 0, mw);
            this.head++;
            return this;
        };
        this[name].tag = name;
    };
    Builder.prototype.pre = function (name, mw) {
        for (var i = 0; i < this.middlewares.length; i++) {
            if (this.middlewares[i].tag == name) {
                this.middlewares.splice(i, 0, mw);
                return;
            }
        }
    };
    Builder.prototype.post = function (name, mw) {
        for (var i = 0; i < this.middlewares.length; i++) {
            if (this.middlewares[i].tag == name) {
                this.middlewares.splice(i + 1, 0, mw);
                return;
            }
        }
    };
    Builder.prototype.expose = function () {
        return this.middlewares;
    };
    return Builder;
}());
exports.Builder = Builder;
