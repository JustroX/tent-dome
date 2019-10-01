"use strict";
/**
* ### Builder Module
* This module is used for intuitive construction of route enpoints via chaining middlewares
*
* Example:
*
* ```
* let builder = new Builder("Builder");
* builder
*    .parseBody()
*    .parseCookie()
*    .getDatabaseDocument()
*    .custom((req,res,next)=>
*    {
*      	console.log("Hello");
*      	next();
*    })
*    .userDefined1()
*    .userDefined2()
*    .success();
*
*
* let middlewares = builder.expose();
* ```
*
* @module Builder
*/
exports.__esModule = true;
/**
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
*/
var middlewares_1 = require("./middlewares");
var Assert = require("assert");
/**
* Route endpoint builder. A class for intuitive construction of route enpoints by chaining middlewares.
*
* @typeparam T Schema interface.
*
*/
var Builder = /** @class */ (function () {
    /**
    * @param name Name of the builder.
    * @param options builder options.
    */
    function Builder(name, options) {
        if (options === void 0) { options = {
            'import builtin': true
        }; }
        /** Current middleware sequence */
        this.middlewares = [];
        /** Current head index */
        this.head = 0;
        /** Name of the builder */
        this.name = '';
        /** Dictionary for defined middleware factories */
        this.builds = {};
        this.name = name;
        if (options['import builtin']) {
            this.importBuiltIn();
        }
    }
    /**
    * Adds a custom middleware after the current head. Moves head by one.
    * @param mw Middleware to add.
    */
    Builder.prototype.custom = function (mw) {
        this.middlewares.splice(this.head, 0, mw);
        this.head++;
        return this;
    };
    /**
    * Points head to another index.
    * @param index New head index.
    */
    Builder.prototype.pointHead = function (index) {
        Assert(index >= 0 && index < this.middlewares.length, 'Head index out of range');
        this.head = index;
        return this;
    };
    /**
    * Returns the current middleware pointed by the head.
    */
    Builder.prototype.lookHead = function () {
        return this.middlewares[this.head];
    };
    /**
    * Points head to the previous middleware.
    */
    Builder.prototype.prevHead = function () {
        this.pointHead(this.head - 1);
        return this;
    };
    /**
    * Points head to the next middleware.
    */
    Builder.prototype.nextHead = function () {
        this.pointHead(this.head + 1);
        return this;
    };
    /**
    * Replaces middleware on the head by another middleware.
    * @param mw Middlware to replace.
    */
    Builder.prototype.replaceHead = function (mw) {
        this.middlewares[this.head] = mw;
    };
    /**
    * Removes the last middleware on the sequence. Moves the head to the previous one if the head is pointing to the last element.
    */
    Builder.prototype.pop = function () {
        this.middlewares.pop();
        this.head = Math.min(this.head, this.middlewares.length - 1);
    };
    /**
    * Import built in middlewares.
    */
    Builder.prototype.importBuiltIn = function () {
        this.define('model', middlewares_1.Middlewares.model);
        this.define('create', middlewares_1.Middlewares.create);
        this.define('save', middlewares_1.Middlewares.save);
        this.define('read', middlewares_1.Middlewares.read);
        this.define('remove', middlewares_1.Middlewares.remove);
        this.define('assign', middlewares_1.Middlewares.assign);
        this.define('sanitize', middlewares_1.Middlewares.sanitize);
        this.define('param', middlewares_1.Middlewares.param);
        this.define('list', middlewares_1.Middlewares.list);
        this.define('success', middlewares_1.Middlewares.success);
        this.define('show', middlewares_1.Middlewares.show);
        this.define('present', middlewares_1.Middlewares.present);
        this.define('return', middlewares_1.Middlewares["return"]);
        this.define('method', middlewares_1.Middlewares.method);
        this.define('static', middlewares_1.Middlewares.static);
    };
    /**
    * Defines a reusable middleware inside the builder. Chainable middleware factory will be available once called.
    * @param name Name of the middleware
    * @param mw Middleware
    */
    Builder.prototype.define = function (name, mw) {
        Assert(!this[name], 'Builder pipe is already defined');
        var _this = this;
        this.builds[name] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _this.middlewares.splice(_this.head, 0, mw.apply(void 0, args));
            _this.head++;
            return _this;
        };
        this.builds[name].tag = name;
        Object.defineProperty(this, name, {
            get: function () {
                return this.builds[name];
            }
        });
    };
    /**
    * Inserts a middleware before a reusable middleware.
    * @param name Name of the reusable middleware
    * @param mw Middleware
    */
    Builder.prototype.pre = function (name, mw) {
        for (var i = 0; i < this.middlewares.length; i++) {
            if (this.middlewares[i].tag === name) {
                this.middlewares.splice(i, 0, mw);
                return;
            }
        }
    };
    /**
    * Inserts a middleware after a reusable middleware.
    * @param name Name of the reusable middleware
    * @param mw Middleware
    */
    Builder.prototype.post = function (name, mw) {
        for (var i = 0; i < this.middlewares.length; i++) {
            if (this.middlewares[i].tag === name) {
                this.middlewares.splice(i + 1, 0, mw);
                return;
            }
        }
    };
    /**
    * Returns the sequence of middlewares.
    */
    Builder.prototype.expose = function () {
        return this.middlewares;
    };
    return Builder;
}());
exports.Builder = Builder;
