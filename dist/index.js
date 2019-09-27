"use strict";
/**
* # Tent Framework
* This module contains functions and definitions needed to setup a tent app.
* @module Tent
*/
exports.__esModule = true;
/**
*
* Copyright (C) 2019  Justine Che T. Romero
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
********/
var mongoose_1 = require("mongoose");
var model_1 = require("./components/model");
var server_1 = require("./components/server");
// Expose Plugin Module
var PluginModule = require("./components/plugin");
// Expose Route Module
var RouteModule = require("./components/route");
// Expose Prebuilt Plugins
var SanitationPluginModule = require("./components/plugins/sanitation");
var ValidationModule = require("./components/plugins/validation");
/** Expose Plugin Class */
exports.Plugin = PluginModule.Plugin;
;
/** Expose Route Class */
exports.Route = RouteModule.Routes;
exports.Sanitation = SanitationPluginModule.Sanitation;
exports.Validation = ValidationModule.Validation;
/** Expose mongoose types */
exports.Types = mongoose_1.Schema.Types;
/**
* Tent-Dome module.
*/
var TentDome = /** @class */ (function () {
    function TentDome() {
        /**
            Application Server
        */
        this.AppServer = {};
        this.TentOptions = {};
        this.Models = [];
        this.setDefaultOptions();
    }
    /**
    *  Initialize the app.
    * @param options  Tent application configuration.
    */
    TentDome.prototype.init = function (options) {
        for (var i in options) {
            this.TentOptions[i] = options[i];
        }
        this.AppServer = new server_1.Server();
    };
    /**
    * Sets the default options for the application.
    */
    TentDome.prototype.setDefaultOptions = function () {
        this.set('api prefix', 'api');
    };
    /**
     * Sets an application variable
     * @param key  Variable name
     * @param value  Variable value
     */
    TentDome.prototype.set = function (key, value) {
        this.TentOptions[key] = value;
    };
    /**
     * Get the value of an application variable
     *
     * @param key  Variable name
     */
    TentDome.prototype.get = function (key) {
        return this.TentOptions[key];
    };
    /**
     *Creates a new database model entity.
     * @param name  Name of the entity.
     * @param schema  Mongoose schema of the model.
     * @param config  Mongoose model configuration.
     * @typeparam T Schema interface of the model.
     */
    TentDome.prototype.Entity = function (name, schema, config) {
        if (config === void 0) { config = {}; }
        var model = new model_1.Model(name);
        if (schema) {
            model.define(schema, config);
        }
        return model;
    };
    /**
    *Start the application
    *
    *@param port The port of the server.
    */
    TentDome.prototype.start = function (port) {
        if (port === void 0) { port = 7072; }
        model_1.RegisterModels(this.app());
        this.AppServer.initDatabase(this.get('mongodb uri'));
        return this.AppServer.start(port);
    };
    /**
    * Returns the http server.
    */
    TentDome.prototype.server = function () {
        return this.AppServer.server;
    };
    /**
    *Returns the express app.
    */
    TentDome.prototype.app = function () {
        return this.AppServer.app;
    };
    return TentDome;
}());
exports.TentDome = TentDome;
exports.Tent = new TentDome();
