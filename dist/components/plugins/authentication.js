"use strict";
/**
* @module AuthenticationPlugin
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var index_1 = require("../../index");
var utils_1 = require("./authentication/utils");
var exjwt = require("express-jwt");
var assert = require("assert");
var AuthenticationPlugin = /** @class */ (function () {
    function AuthenticationPlugin() {
        /** All endpoints with no authentication */
        this.noAuth = [];
    }
    /** Allow non-authenticated user to access a certain enpoint */
    AuthenticationPlugin.prototype.allow = function (endpoint, method) {
        this.noAuth.push({
            endpoint: endpoint,
            method: method
        });
    };
    /** Allow non-authenticated user to access POST /  */
    AuthenticationPlugin.prototype.create = function () {
        this.allow('/', 'POST');
    };
    /** Allow non-authenticated user to access GET /  */
    AuthenticationPlugin.prototype.read = function () {
        this.allow('/', 'GET');
    };
    /** Allow non-authenticated user to access PUT /  */
    AuthenticationPlugin.prototype.update = function () {
        this.allow('/', 'PUT');
    };
    /** Allow non-authenticated user to access DELETE /  */
    AuthenticationPlugin.prototype["delete"] = function () {
        this.allow('/', 'DELETE');
    };
    /** Allow non-authenticated user to access LIST /  */
    AuthenticationPlugin.prototype.list = function () {
        this.allow('/', 'LIST');
    };
    /** Allow non-authenticated user to access a model method  */
    AuthenticationPlugin.prototype.method = function (methodName, method) {
        this.allow('/do/' + methodName, method);
    };
    /** Allow non-authenticated user to access a model static method  */
    AuthenticationPlugin.prototype.static = function (methodName, method) {
        this.allow('/do/' + methodName, method);
    };
    /** Middleware that returns `403` when non-authenticated users access the endpoint.  */
    AuthenticationPlugin.prototype.failHandler = function (req, res) {
        res.tent.apiError(403, 'Forbidden.');
    };
    /** Replaces default failHandler.  */
    AuthenticationPlugin.prototype.onFail = function (mw) {
        this.failHandler = mw;
    };
    /** Replaces default authMiddleware.  */
    AuthenticationPlugin.prototype.onAuth = function (mw) {
        this.authMiddleware = mw;
    };
    /** Middleware that blocks if user is unauthenticated */
    AuthenticationPlugin.prototype.authMiddleware = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (req.user) {
                    next();
                }
                else {
                    return [2 /*return*/, res.tent.apiError(403, 'Forbidden.')];
                }
                return [2 /*return*/];
            });
        });
    };
    /** Blocks access of non-authenticated user in the current model */
    AuthenticationPlugin.prototype.init = function () {
        if (!this.model)
            throw new Error('No model is defined.');
        var _this = this;
        var secret = index_1.Tent.get('auth secret');
        assert(secret, 'Please set global `auth secret` in the Tent configuration.');
        var jwtMW = exjwt({ secret: secret });
        var userModelName = index_1.Tent.get('auth user');
        if (userModelName === this.model.name) {
            utils_1.buildSchema();
        }
        // Tent.app().use();
        this.authMiddleware.tag = 'auth';
        var _loop_1 = function (i) {
            var builderObj = this_1.model.Routes.builders[i];
            var builder = builderObj.builder;
            var method = builderObj.method;
            var endpoint = builderObj.endpoint;
            if (this_1.noAuth.filter(function (x) {
                return (x.method === method && x.endpoint === endpoint);
            }).length === 0) {
                if (userModelName === this_1.model.name && method === 'POST' && (endpoint === '/login' || endpoint === '/signup')) {
                    return "continue";
                }
                else {
                    builder.pre('model', jwtMW);
                    builder.pre('model', function (err, req, res, next) {
                        if (err.name === 'UnauthorizedError') {
                            if (res.tent) {
                                _this.failHandler(req, res, next);
                            }
                            else {
                                res.status(403).send({ error: 'Unauthorized.', err: err.name });
                            }
                        }
                        else {
                            next(err);
                        }
                    });
                    builder.pre('model', this_1.authMiddleware);
                }
            }
        };
        var this_1 = this;
        for (var i in this.model.Routes.builders) {
            _loop_1(i);
        }
    };
    ;
    AuthenticationPlugin = __decorate([
        plugin_1.Plugin({
            name: 'auth',
            dependencies: []
        })
    ], AuthenticationPlugin);
    return AuthenticationPlugin;
}());
exports.AuthenticationPlugin = AuthenticationPlugin;
;
