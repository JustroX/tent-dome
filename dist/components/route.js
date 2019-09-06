"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var index_1 = require("../index");
var Middlewares = require("./routes/middlewares");
var builder_1 = require("./routes/builder");
var express_1 = require("express");
var Routes = /** @class */ (function () {
    function Routes(name) {
        this.name = "";
        this.name = name;
        this.router = new express_1.Router();
    }
    Routes.prototype.register = function () {
        var _a, _b, _c;
        for (var endpoint in this.builders) {
            var item = this.builders[endpoint];
            var method = item.method.toLowerCase();
            var builder = item.builder;
            if (method == "list")
                (_a = this.router).get.apply(_a, __spreadArrays([endpoint], builder.expose()));
            else if (method == "post")
                (_b = this.router).post.apply(_b, __spreadArrays([endpoint], builder.expose()));
            else
                (_c = this.router)[method].apply(_c, __spreadArrays([endpoint + "/:id"], builder.expose()));
        }
    };
    Routes.prototype.endpoint = function (endpoint, method, fresh) {
        if (fresh === void 0) { fresh = false; }
        var a = {
            builder: new builder_1.Builder(this.name),
            method: method
        };
        this.builders[endpoint] = a;
        return a.builder;
    };
    Routes.prototype.expose = function () {
        return this.router;
    };
    /**
     * Default Builders
     */
    Routes.prototype.create = function (endpoint, fresh) {
        if (fresh === void 0) { fresh = false; }
        var builder = this.endpoint(endpoint, "POST", fresh);
        builder
            .model()
            .create()
            .sanitize()
            .assign()
            .save();
        return builder;
    };
    Routes.prototype.update = function (endpoint, fresh) {
        if (fresh === void 0) { fresh = false; }
        var builder = this.endpoint(endpoint, "PUT", fresh);
        builder
            .model()
            .read()
            .sanitize()
            .assign()
            .save();
        return builder;
    };
    Routes.prototype.read = function (endpoint, fresh) {
        if (fresh === void 0) { fresh = false; }
        var builder = this.endpoint(endpoint, "GET", fresh);
        builder
            .model()
            .read();
        return builder;
    };
    Routes.prototype.list = function (endpoint, fresh) {
        if (fresh === void 0) { fresh = false; }
        var builder = this.endpoint(endpoint, "LIST", fresh);
        builder
            .model()
            .param()
            .list();
        return builder;
    };
    Routes.prototype["delete"] = function (endpoint, fresh) {
        if (fresh === void 0) { fresh = false; }
        var builder = this.endpoint(endpoint, "DELETE", fresh);
        builder
            .model()
            .read()
            .remove();
        return builder;
    };
    return Routes;
}());
exports.Routes = Routes;
function RegisterRoute() {
    var prefix = index_1.Tent.get("api prefix");
    var router = new express_1.Router();
    router.use("/" + prefix, Middlewares.initTent);
    return router;
}
exports.RegisterRoute = RegisterRoute;
