"use strict";
/**
* @module ValidationPlugin
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
var Joi = require("@hapi/joi");
/**
* Utility function for chainable constraints definition
*/
var ConstraintUtility = /** @class */ (function () {
    /**
    * @param parent Validation instance
    */
    function ConstraintUtility(parent) {
        this.parent = parent;
    }
    /**
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    ConstraintUtility.prototype.and = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var list = [];
        for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
            var arg = args_1[_a];
            if (typeof arg === 'string') {
                list.push(arg);
            }
            else {
                this.parent.constraints.and.options = arg;
            }
        }
        this.parent.constraints.and.peers.push(list);
    };
    /**
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    ConstraintUtility.prototype.nand = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var list = [];
        for (var _a = 0, args_2 = args; _a < args_2.length; _a++) {
            var arg = args_2[_a];
            if (typeof arg === 'string') {
                list.push(arg);
            }
            else {
                this.parent.constraints.nand.options = arg;
            }
        }
        this.parent.constraints.nand.peers.push(list);
    };
    /**
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    ConstraintUtility.prototype.or = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var list = [];
        for (var _a = 0, args_3 = args; _a < args_3.length; _a++) {
            var arg = args_3[_a];
            if (typeof arg === 'string') {
                list.push(arg);
            }
            else {
                this.parent.constraints.or.options = arg;
            }
        }
        this.parent.constraints.or.peers.push(list);
    };
    /**
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    ConstraintUtility.prototype.oxor = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var list = [];
        for (var _a = 0, args_4 = args; _a < args_4.length; _a++) {
            var arg = args_4[_a];
            if (typeof arg === 'string') {
                list.push(arg);
            }
            else {
                this.parent.constraints.oxor.options = arg;
            }
        }
        this.parent.constraints.oxor.peers.push(list);
    };
    /**
    * @param field field to have the relation.
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    ConstraintUtility.prototype["with"] = function (field) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.parent.constraints["with"][field] === undefined) {
            this.parent.constraints["with"][field] = { peers: [], options: {} };
        }
        for (var _b = 0, args_5 = args; _b < args_5.length; _b++) {
            var arg = args_5[_b];
            if (typeof arg === 'string') {
                this.parent.constraints["with"][field].peers.push(arg);
            }
            else if (arg instanceof Array) {
                (_a = this.parent.constraints["with"][field].peers).push.apply(_a, arg);
            }
            else {
                this.parent.constraints["with"][field].options = arg;
            }
        }
    };
    /**
    * @param field field to have the relation.
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    ConstraintUtility.prototype.without = function (field) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.parent.constraints.without[field] === undefined) {
            this.parent.constraints.without[field] = { peers: [], options: {} };
        }
        for (var _b = 0, args_6 = args; _b < args_6.length; _b++) {
            var arg = args_6[_b];
            if (typeof arg === 'string') {
                this.parent.constraints.without[field].peers.push(arg);
            }
            else if (arg instanceof Array) {
                (_a = this.parent.constraints.without[field].peers).push.apply(_a, arg);
            }
            else {
                this.parent.constraints.without[field].options = arg;
            }
        }
    };
    /**
    * @param args - if `args[i]` is string, `args[i]` is a peer
                    if `args[i]` is Constraint option, it will be the new option for the relation
    */
    ConstraintUtility.prototype.xor = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var list = [];
        for (var _a = 0, args_7 = args; _a < args_7.length; _a++) {
            var arg = args_7[_a];
            if (typeof arg === 'string') {
                list.push(arg);
            }
            else {
                this.parent.constraints.xor.options = arg;
            }
        }
        this.parent.constraints.xor.peers.push(list);
    };
    return ConstraintUtility;
}());
exports.ConstraintUtility = ConstraintUtility;
/**
* Validation Plugin
* This adds validation middleware on `POST` and `PUT`
*/
var Validation = /** @class */ (function () {
    function Validation() {
        /** Joi reference. */
        this.joi = Joi;
        /** Validation schema. */
        this.definition = {};
        /** Validation contraints */
        this.constraints = {
            and: { peers: [], options: {} },
            nand: { peers: [], options: {} },
            oxor: { peers: [], options: {} },
            or: { peers: [], options: {} },
            xor: { peers: [], options: {} },
            "with": {},
            without: {}
        };
    }
    /** Defines the validation Schema. */
    Validation.prototype.schema = function (schema) {
        this.definition = schema;
        return new ConstraintUtility(this);
    };
    /** Validation middleware factory. This will be called on init. */
    Validation.prototype.validationMiddleware = function () {
        var onFailMiddleware = this.onFailMiddlewareFactory();
        var _this = this;
        return function (req, res, next) {
            req.tent.plugins.validation = {};
            // Set up validation schema
            var validation = _this;
            var schema = Joi.object(validation.definition);
            var isRequired = req.method === 'POST';
            if (!isRequired) {
                schema = schema.optionalKeys(Object.keys(validation.definition));
            }
            var constraints = validation.constraints;
            for (var i in constraints) {
                switch (i) {
                    case 'and':
                        for (var _i = 0, _a = constraints.and.peers; _i < _a.length; _i++) {
                            var peer = _a[_i];
                            schema.and.apply(schema, peer);
                        }
                        break;
                    case 'nand':
                        for (var _b = 0, _c = constraints.nand.peers; _b < _c.length; _b++) {
                            var peer = _c[_b];
                            schema.nand.apply(schema, peer);
                        }
                        break;
                    case 'oxor':
                        for (var _d = 0, _e = constraints.oxor.peers; _d < _e.length; _d++) {
                            var peer = _e[_d];
                            schema.oxor.apply(schema, peer);
                        }
                        break;
                    case 'or':
                        for (var _f = 0, _g = constraints.or.peers; _f < _g.length; _f++) {
                            var peer = _g[_f];
                            schema.or.apply(schema, peer);
                        }
                        break;
                    case 'xor':
                        for (var _h = 0, _j = constraints.xor.peers; _h < _j.length; _h++) {
                            var peer = _j[_h];
                            schema.xor.apply(schema, peer);
                        }
                        break;
                    // with and withouts
                }
            }
            var _k = schema.validate(req.tent.payload), value = _k.value, error = _k.error;
            req.tent.plugins.validation.value = value;
            req.tent.plugins.validation.error = error;
            if (error) {
                onFailMiddleware(req, res, next);
            }
            else {
                next();
            }
        };
    };
    /** This function will replace the current `onFailMiddlewareFactory` by the parameter. */
    Validation.prototype.onFail = function (mw) {
        this.onFailMiddlewareFactory = mw;
    };
    /** Default on fail middleware factory */
    Validation.prototype.onFailMiddlewareFactory = function () {
        /** On fail middleware */
        return function (req, res) {
            res.tent.apiError(400, req.tent.plugins.validation.error.details[0].message);
        };
    };
    /** Plugin initialization */
    Validation.prototype.init = function () {
        this.model.Routes.builder('/', 'POST').post('sanitize', this.validationMiddleware());
        this.model.Routes.builder('/', 'PUT').post('sanitize', this.validationMiddleware());
    };
    Validation = __decorate([
        plugin_1.Plugin({
            name: 'validation',
            dependencies: []
        })
    ], Validation);
    return Validation;
}());
exports.Validation = Validation;
