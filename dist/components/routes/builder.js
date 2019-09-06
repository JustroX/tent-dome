"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Middlewares = require("./middlewares");
var Assert = require("assert");
var Hooks = require("hooks");
var BUILT_IN_FACTORIES = [
    "model",
    "create",
    "save",
    "read",
    "remove",
    "assign",
    "sanitize",
    "param",
    "list",
];
var Builder = /** @class */ (function (_super) {
    __extends(Builder, _super);
    function Builder(name) {
        var _this_1 = _super.call(this) || this;
        _this_1.middlewares = [];
        _this_1.head = 0;
        _this_1.name = "";
        _this_1.importBuiltIn();
        _this_1.name = name;
        return _this_1;
    }
    Builder.prototype.custom = function (mw) {
        this.middlewares.splice(this.head, 0, mw);
        this.head++;
    };
    Builder.prototype.pointHead = function (index) {
        Assert(index >= 0 && index < this.middlewares.length, "Head index out of range");
        this.head = index;
    };
    Builder.prototype.lookHead = function () {
        return this.middlewares[this.head];
    };
    Builder.prototype.prevHead = function () {
        this.pointHead(this.head - 1);
    };
    Builder.prototype.nextHead = function () {
        this.pointHead(this.head + 1);
    };
    Builder.prototype.importBuiltIn = function () {
        for (var _i = 0, BUILT_IN_FACTORIES_1 = BUILT_IN_FACTORIES; _i < BUILT_IN_FACTORIES_1.length; _i++) {
            var mw = BUILT_IN_FACTORIES_1[_i];
            this.define(mw, Middlewares[mw](this.name));
        }
    };
    Builder.prototype.define = function (name, mw) {
        Assert(!this[name], "Builder pipe is already defined");
        var _this = this;
        this[name] = function () {
            this.middlewares.splice(this.head, 0, mw);
        };
        this.hook(name, mw);
    };
    Builder.prototype.preHook = function (name, mw) {
        this.pre(name, function (nextHook, req, res, next) {
            mw(req, res, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (args.length)
                    next.apply(void 0, args);
                else
                    nextHook(req, res, next);
            });
        });
    };
    Builder.prototype.postHook = function (name, mw) {
        this.post(name, function (nextHook, req, res, next) {
            mw(req, res, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (args.length)
                    next.apply(void 0, args);
                else
                    nextHook(req, res, next);
            });
        });
    };
    Builder.prototype.expose = function () {
        return this.middlewares;
    };
    return Builder;
}(Hooks));
exports.Builder = Builder;
