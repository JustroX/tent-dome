"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var middlewares_1 = require("./routes/middlewares");
var builder_1 = require("./routes/builder");
var express_1 = require("express");
var assert = require("assert");
var Routes = /** @class */ (function () {
    function Routes(name) {
        this.builders = [];
        this.name = "";
        this.name = name;
        this.router = express_1.Router();
    }
    Routes.prototype.register = function () {
        var _a, _b, _c;
        for (var i in this.builders) {
            var item = this.builders[i];
            var endpoint = item.endpoint;
            var method = item.method.toLowerCase();
            var builder = item.builder;
            if (method == "list")
                (_a = this.router).get.apply(_a, __spreadArrays([endpoint], builder.expose()));
            else if (method == "post")
                (_b = this.router).post.apply(_b, __spreadArrays([endpoint], builder.expose()));
            else
                (_c = this.router)[method].apply(_c, __spreadArrays([endpoint + ":id"], builder.expose()));
        }
    };
    Routes.prototype.endpoint = function (endpoint, method) {
        var a = {
            builder: new builder_1.Builder(this.name),
            method: method,
            endpoint: endpoint
        };
        this.builders.push(a);
        return a.builder;
    };
    Routes.prototype.builder = function (endpoint, method) {
        var builder = this.builders.filter(function (x) { return x.endpoint == endpoint && x.method == method; })[0];
        assert(builder, "Builder endpoint is not yet defined.");
        return builder.builder;
    };
    Routes.prototype.expose = function () {
        return this.router;
    };
    /**
     * Default Builders
     */
    Routes.prototype.create = function () {
        var builder = this.endpoint("/", "POST");
        builder
            .model(this.name)
            .create()
            .sanitize()
            .assign()
            .save()
            .show();
        return builder;
    };
    Routes.prototype.update = function () {
        var builder = this.endpoint("/", "PUT");
        builder
            .model(this.name)
            .read()
            .sanitize()
            .assign()
            .save()
            .show();
        return builder;
    };
    Routes.prototype.read = function () {
        var builder = this.endpoint("/", "GET");
        builder
            .model(this.name)
            .read()
            .show();
        return builder;
    };
    Routes.prototype.list = function () {
        var builder = this.endpoint("/", "LIST");
        builder
            .model(this.name)
            .param()
            .list()
            .present();
        return builder;
    };
    Routes.prototype["delete"] = function () {
        var builder = this.endpoint("/", "DELETE");
        builder
            .model(this.name)
            .read()
            .remove()
            .success();
        return builder;
    };
    return Routes;
}());
exports.Routes = Routes;
function RegisterRoute() {
    var router = express_1.Router();
    router.use("/", middlewares_1.Middlewares.initTent);
    return router;
}
exports.RegisterRoute = RegisterRoute;
