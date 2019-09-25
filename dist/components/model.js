"use strict";
/**
* ### Model Module
* This module is the parent class of all entities for the tent app.
*
* @module Model
*/
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
var index_1 = require("../index");
var schema_1 = require("./schema");
var route_1 = require("./route");
var expand_1 = require("./expand");
var pluralize = require("pluralize");
var Assert = require("assert");
/**
* Dictionary for storing Models
*/
var Models = {};
/**
* Returns a specified Model.
* @param name  Name of the model
*/
function get(name) {
    return Models[name];
}
exports.get = get;
/**
* Registers all the model to the express app.
* @param app  Express application
*/
function RegisterModels(app) {
    app.use("/" + index_1.Tent.get("api prefix"), route_1.RegisterRoute());
    for (var name_1 in Models) {
        var model = Models[name_1];
        app.use("/" + index_1.Tent.get("api prefix") + "/" + model.dbname, model.Routes.expose());
    }
}
exports.RegisterModels = RegisterModels;
/**
* This is the Model class used for defining database entities.
* @typeparam T Schema interface of the model
*/
var Model = /** @class */ (function () {
    /**
    * @param name  name of the model
    */
    function Model(name) {
        /**
        * Dictionary to store the plugins.
        */
        this.plugins = {};
        this.name = name;
        this.dbname = pluralize(name);
        this.Routes = new route_1.Routes(this.name);
        this.Schema = new schema_1.Schema(name);
        this.Expand = new expand_1.Expand();
    }
    /**
    * Defines the model schema.
    * @param schema  Mongoose schema of the model.
    * @param config  Mongoose model configuration.
    */
    Model.prototype.define = function (schema, config) {
        if (config === void 0) { config = {}; }
        this.Schema.define(schema, config);
    };
    /**
    * Registers the model
    */
    Model.prototype.register = function () {
        this.Schema.register();
        this.Routes.register();
        for (var i in this.plugins) {
            this.plugins[i].model = this;
            this.plugins[i].init();
        }
        Models[this.name] = this;
    };
    /**
    * Installs a plugin.
    * @param plugin  Plugin to install.
    */
    Model.prototype.install = function (plugin) {
        var _this = this;
        //plugin validity
        Assert(plugin.name, "Invalid plugin.");
        Assert(plugin.dependencies, "Invalid plugin.");
        Assert(plugin.init, "Invalid plugin.");
        Assert(!(plugin.name in this.plugins), "Plugin is already installed.");
        var missing_dependencies = plugin.dependencies.filter(function (x) { return !(x in _this.plugins); });
        Assert(!missing_dependencies.length, "Plugin dependencies are not yet installed : " + missing_dependencies.join(","));
        this.plugins[plugin.name] = plugin;
    };
    return Model;
}());
exports.Model = Model;
