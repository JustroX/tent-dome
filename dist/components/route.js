"use strict";
/**
 * @module Routes
 *
 *
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
/*******
*
*	Copyright (C) 2019  Justine Che T. Romero
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
********/
var middlewares_1 = require("./routes/middlewares");
var builder_1 = require("./routes/builder");
var express_1 = require("express");
var assert = require("assert");
/**
* Routes class. This class is responsible for organizing and structuring routers and url endpoints of the model.
* @typeparam T schema of the model
*/
var Routes = /** @class */ (function () {
    /**
    * @param name pluralized name of the current model
    */
    function Routes(name) {
        /** List of builder definitions */
        this.builders = [];
        /** Name of the current model. */
        this.name = '';
        this.name = name;
        this.router = express_1.Router();
    }
    /**
    * Registers the current route. Exposes the builders to their endpoints.
    */
    Routes.prototype.register = function () {
        var _a, _b, _c;
        for (var i in this.builders) {
            var item = this.builders[i];
            var endpoint = item.endpoint;
            var method = item.method.toLowerCase();
            var builder = item.builder;
            if (method === 'list') {
                (_a = this.router).get.apply(_a, __spreadArrays([endpoint], builder.expose()));
            }
            else if (method === 'post') {
                (_b = this.router).post.apply(_b, __spreadArrays([endpoint], builder.expose()));
            }
            else {
                (_c = this.router)[method].apply(_c, __spreadArrays(['/:id' + endpoint], builder.expose()));
            }
        }
    };
    /**
    * Constructs a new endpoint. Returns the builder.
    * @param endpoint name of the new endpoint
    * @param method HTTP method
    */
    Routes.prototype.endpoint = function (endpoint, method) {
        var a = {
            builder: new builder_1.Builder(this.name),
            method: method,
            endpoint: endpoint
        };
        this.builders.push(a);
        return a.builder;
    };
    /**
    * Returns the builder of an already defined endpoint in this route.
    * @param endpoint name of the endpoint
    * @param method HTTP method
    */
    Routes.prototype.builder = function (endpoint, method) {
        var builder = this.builders.filter(function (x) { return x.endpoint === endpoint && x.method === method; })[0];
        assert(builder, 'Builder endpoint is not yet defined.');
        return builder.builder;
    };
    /**
    * Returns an express router.
    */
    Routes.prototype.expose = function () {
        return this.router;
    };
    /**
     * Creates a new endpoint with predefined middlewares to create a new document. Returns the builder.
     */
    Routes.prototype.create = function () {
        var builder = this.endpoint('/', 'POST');
        builder
            .model(this.name)
            .create()
            .sanitize()
            .assign()
            .save()
            .show();
        return builder;
    };
    /**
     * Creates a new endpoint with predefined middlewares to update a new document. Returns the builder.
     */
    Routes.prototype.update = function () {
        var builder = this.endpoint('/', 'PUT');
        builder
            .model(this.name)
            .read()
            .sanitize()
            .assign()
            .save()
            .show();
        return builder;
    };
    /**
     * Creates a new endpoint with predefined middlewares to read a new document. Returns the builder.
     */
    Routes.prototype.read = function () {
        var builder = this.endpoint('/', 'GET');
        builder
            .model(this.name)
            .read()
            .show();
        return builder;
    };
    /**
     * Creates a new endpoint with predefined middlewares to list a query. Returns the builder.
     */
    Routes.prototype.list = function () {
        var builder = this.endpoint('/', 'LIST');
        builder
            .model(this.name)
            .param()
            .list()
            .present();
        return builder;
    };
    /**
     * Creates a new endpoint with predefined middlewares to delete a new document. Returns the builder.
     */
    Routes.prototype["delete"] = function () {
        var builder = this.endpoint('/', 'DELETE');
        builder
            .model(this.name)
            .read()
            .remove()
            .success();
        return builder;
    };
    /**
     * Creates a new endpoint with predefined middlewares to execute a method of a document. Returns the builder.
     * @param name Name of the method
     * @param requestMethod Request method.
     */
    Routes.prototype.method = function (name, requestMethod) {
        var builder = this.endpoint('/do/' + name, requestMethod);
        builder
            .model(this.name)
            .read()
            .method(name)["return"]();
        return builder;
    };
    /**
     * Creates a new endpoint with predefined middlewares to execute a static method of a model. Returns the builder.
     * @param name Name of the static method
     * @param requestMethod Request method.
     */
    Routes.prototype.static = function (name, requestMethod) {
        var builder = this.endpoint('/do/' + name, requestMethod);
        builder
            .model(this.name)
            .static(name)["return"]();
        return builder;
    };
    return Routes;
}());
exports.Routes = Routes;
/**
 * Inserts the tent configuration middleware to an express router. Returns the router.
 */
function RegisterRoute() {
    var router = express_1.Router();
    router.use('/', middlewares_1.Middlewares.initTent);
    return router;
}
exports.RegisterRoute = RegisterRoute;
