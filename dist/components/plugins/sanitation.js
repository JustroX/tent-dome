"use strict";
/**
* ## Sanitation Plugin
*
* This plugin will attach middlewares that would whitelist / blacklist inbound and outbound data of a `Model`.
*
* ### Definition
* - **Inbound Data**  - this is the request body for `PUT` and `POST` - `req.body`
* - **Outbound Data** - this is the `req.tent.document` and `req.tent.list` before `present` or `show` middleware is called.
*
* ### Motivation
* Sanitize requests so users can't alter model fields that are readonly for `user`.
* Also, sanitize responses so users can't read sensitive information.
*
* ### Installation
* Sanitation module comes prebuilt to tent.
*
* ```js
* import { Sanitation } from "tent-dome";
*
* var BooksEntity = tent.Entity("Book",{
* 	name 		  	 : String,
* 	date 		 	 : { type: Date, default: Date.now },
* 	writeonlyField   : String,
* 	readonlyField    : String
* });
* BooksEntity.install(new Sanitation());
*
* ```
*
* ### Usage
*
* Define access rules.
* ```js
*
* 	var rules = BooksEntity.plugins.sanitation;
* 	rules.inbound.blacklist("readonlyField");
* 	rules.outbound.whitelist(["readonlyField", "name", "date"]);
*
* ```
*
* @module SanitationPlugin
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var plugin_1 = require("../plugin");
var assert = require("assert");
function isKey(field) {
    return typeof field === 'string';
}
var Bound = /** @class */ (function () {
    function Bound() {
        this.whitelisted = [];
        this.blacklisted = [];
    }
    Bound.prototype.whitelist = function (field) {
        var _a;
        assert(!this.blacklisted.length, 'You can only whitelist or blaclist but not both.');
        if (isKey(field)) {
            this.whitelisted.push(field);
        }
        else {
            (_a = this.whitelisted).push.apply(_a, field);
        }
    };
    Bound.prototype.blacklist = function (field) {
        var _a;
        assert(!this.whitelisted.length, 'You can only whitelist or blaclist but not both.');
        if (isKey(field)) {
            this.blacklisted.push(field);
        }
        else {
            (_a = this.blacklisted).push.apply(_a, field);
        }
    };
    return Bound;
}());
var Sanitation = /** @class */ (function () {
    function Sanitation() {
        this.inbound = new Bound();
        this.outbound = new Bound();
    }
    Sanitation.prototype.init = function () {
        if (this.model) {
            this.model.Routes.builder('/', 'POST').post('model', this.inboundMiddleware());
            this.model.Routes.builder('/', 'PUT').post('model', this.inboundMiddleware());
            this.model.Routes.builder('/', 'GET').pre('show', this.outboundMiddleware());
            this.model.Routes.builder('/', 'LIST').pre('present', this.outboundMiddleware());
        }
    };
    Sanitation.prototype.inboundMiddleware = function () {
        var _this = this;
        return function (req, res, next) {
            var inbound = _this.inbound;
            if (inbound.whitelisted.length) {
                var body = {};
                for (var _i = 0, _a = inbound.whitelisted; _i < _a.length; _i++) {
                    var i = _a[_i];
                    body[i] = req.body[i];
                }
                req.body = body;
            }
            else {
                for (var _b = 0, _c = inbound.blacklisted; _b < _c.length; _b++) {
                    var i = _c[_b];
                    if (i in req.body) {
                        delete req.body[i];
                    }
                }
            }
            next();
        };
    };
    Sanitation.prototype.outboundMiddleware = function () {
        var _this = this;
        return function (req, res, next) {
            var tent = req.tent;
            // sanitize list
            var outbound = _this.outbound;
            if (outbound.whitelisted.length) {
                if (tent.list) {
                    tent.list = tent.list.map(function (x) {
                        var d = {};
                        for (var _i = 0, _a = outbound.whitelisted; _i < _a.length; _i++) {
                            var i = _a[_i];
                            d[i] = x.get(i);
                        }
                        return d;
                    });
                }
                if (tent.document) {
                    var d = {};
                    for (var _i = 0, _a = outbound.whitelisted; _i < _a.length; _i++) {
                        var i = _a[_i];
                        d[i] = tent.document.get(i);
                    }
                    tent.document = d;
                }
            }
            else {
                if (tent.list) {
                    tent.list = tent.list.map(function (x) {
                        for (var _i = 0, _a = outbound.blacklisted; _i < _a.length; _i++) {
                            var i = _a[_i];
                            if (x[i]) {
                                delete x[i];
                            }
                        }
                        return x;
                    });
                }
                if (tent.document) {
                    for (var _b = 0, _c = outbound.blacklisted; _b < _c.length; _b++) {
                        var i = _c[_b];
                        if (tent.document[i]) {
                            delete tent.document[i];
                        }
                    }
                }
            }
            next();
        };
    };
    Sanitation = __decorate([
        plugin_1.Plugin({
            name: 'sanitation',
            dependencies: []
        })
    ], Sanitation);
    return Sanitation;
}());
exports.Sanitation = Sanitation;
