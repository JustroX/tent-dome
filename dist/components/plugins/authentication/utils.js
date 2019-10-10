"use strict";
/**
* @module AuthenticationPlugin
*/
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
var index_1 = require("../../../index");
var model_1 = require("../../model");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jsonwebtoken");
var Joi = require("@hapi/joi");
var assert = require("assert");
/** @hidden */
function isTentAvailable(tent) {
    return tent !== undefined;
}
/** @hidden */
function isTentCollectionAvailable(collection) {
    return collection !== undefined;
}
/** @hidden */
function buildSchema() {
    var _this = this;
    var userModelName = index_1.Tent.get('auth user');
    var emailToken = index_1.Tent.get('auth email token');
    var passwordToken = index_1.Tent.get('auth password token');
    var secret = index_1.Tent.get('auth secret');
    var options = index_1.Tent.get('auth jwt options');
    var isSignUp = index_1.Tent.get('auth signup');
    var activationToken = index_1.Tent.get('auth activation token');
    assert(userModelName, 'Please set global `auth user` in the Tent configuration. ');
    assert(emailToken, 'Please set global `auth email token` in the Tent configuration. ');
    assert(passwordToken, 'Please set global `auth password token` in the Tent configuration. ');
    assert(secret, 'Please set global `auth secret` in the Tent configuration. ');
    if (isSignUp) {
        assert(activationToken, 'Please set global `auth activation token` in the Tent configuration.');
    }
    var UserModel = model_1.get(userModelName);
    addValidPasswordMethod(UserModel);
    var validationMW = function (req, res, next) {
        // validation
        var raw = {};
        raw[emailToken] = Joi.string().regex(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required();
        raw[passwordToken] = Joi.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!$%@#£€*?&]{8,}$/).required();
        var schema = Joi.object(raw);
        var error = schema.validate(req.body).error;
        if (error) {
            return res.tent.apiError(400, 'Validation failed.');
        }
        next();
    };
    var tokenizeMW = function (req, res, next) {
        var token = jwt.sign(req.tent.document, secret, options || { expiresIn: 129600 });
        req.tent.document = { token: token };
        next();
    };
    tokenizeMW.tag = 'tokenize';
    UserModel.Routes.endpoint('/login', 'POST')
        .model(userModelName)
        .custom(validationMW)
        .custom(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var tent, collection, user, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tent = req.tent;
                    collection = tent.collection;
                    if (!isTentAvailable(tent))
                        throw new Error('Model is not yet called.');
                    if (!isTentCollectionAvailable(collection))
                        throw new Error('Model is not yet called.');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, collection.findUser(req.body[emailToken])];
                case 2:
                    user = _a.sent();
                    if (!user)
                        return [2 /*return*/, res.tent.apiError(401, 'User is non-existent.')];
                    tent.vars.user = user;
                    if (!user.validPassword(req.body[passwordToken])) {
                        return [2 /*return*/, res.tent.apiError(401, 'Password is incorrect.')];
                    }
                    req.tent.document = { id: user.id, username: user[emailToken] };
                    next();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    res.tent.apiError(500, 'Something went wrong.');
                    throw e_1;
                case 4: return [2 /*return*/];
            }
        });
    }); })
        .custom(tokenizeMW)
        .show();
    if (isSignUp) {
        UserModel.Routes.endpoint('/signup', 'POST')
            .model(userModelName)
            .custom(validationMW)
            .model(userModelName)
            .custom(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var tent, collection, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tent = req.tent;
                        collection = tent.collection;
                        if (!isTentAvailable(tent))
                            throw new Error('Model is not yet called.');
                        if (!isTentCollectionAvailable(collection))
                            throw new Error('Model is not yet called.');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, collection.findUser(req.body[emailToken], true)];
                    case 2:
                        if (_a.sent()) {
                            return [2 /*return*/, res.tent.apiError(409, 'User identifier is already taken.')];
                        }
                        else {
                            next();
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        res.tent.apiError(500, 'Something went wrong.');
                        throw e_2;
                    case 4: return [2 /*return*/];
                }
            });
        }); })
            .custom(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var tent, collection, Collection, user, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tent = req.tent;
                        collection = tent.collection;
                        if (!isTentAvailable(tent))
                            throw new Error('Model is not yet called.');
                        if (!isTentCollectionAvailable(collection))
                            throw new Error('Model is not yet called.');
                        Collection = collection;
                        user = new Collection();
                        user.set(activationToken, false);
                        user.set(emailToken, req.body[emailToken]);
                        user.setPassword(req.body[passwordToken]);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, user.save()];
                    case 2:
                        _a.sent();
                        tent.vars.user = user;
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        res.tent.apiError(500, 'Something went wrong.');
                        throw e_3;
                    case 4:
                        req.tent.document = { id: user.id, username: user[emailToken] };
                        next();
                        return [2 /*return*/];
                }
            });
        }); })
            .custom(tokenizeMW)
            .show();
    }
}
exports.buildSchema = buildSchema;
/** @hidden */
function addValidPasswordMethod(User) {
    var passwordToken = index_1.Tent.get('auth password token');
    var activationToken = index_1.Tent.get('auth activation token');
    var isSignUp = index_1.Tent.get('auth signup');
    User.Schema.method('validPassword', function (password) {
        if (this[passwordToken] && password) {
            return bcrypt.compareSync(password, this[passwordToken]);
        }
        return false;
    });
    User.Schema.method('setPassword', function (password) {
        this[passwordToken] = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    });
    User.Schema.static('findUser', function (email, activation) {
        return __awaiter(this, void 0, void 0, function () {
            var emailToken, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        emailToken = index_1.Tent.get('auth email token');
                        query = {};
                        query[emailToken] = email;
                        if (isSignUp || activation) {
                            query[activationToken] = true;
                        }
                        return [4 /*yield*/, User.Schema.model.find(query)];
                    case 1: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    });
}
