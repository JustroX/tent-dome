"use strict";
/**
*	@module Schema
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
var mongoose_1 = require("mongoose");
/**
* This is the Schema class which encapsulates the Mongoose business part of the model.
* @typeparam T Schema interface of the model
*/
var Schema = /** @class */ (function () {
    /**
    * @param name The name of the model
    */
    function Schema(name) {
        this.schema = {};
        this.virtuals = {};
        this.config = {};
        this.name = name;
    }
    /**
    * Define a Mongoose model.
    * @param schema Definition of the model. Mongoose schema
    * @param config Mongoose schema configuration.
    */
    Schema.prototype.define = function (schema, config) {
        this.schema = schema;
        if (config)
            for (var i in config)
                this.set(i, config[i]);
    };
    /**
    * Defines a virtual field for the object
    * @param key name of the virtual field
    * @param virtual virtual field definition
    * @typeparam T data type of the virtual field
    */
    Schema.prototype.virtual = function (key, virtual) {
        this.virtuals[key] = virtual;
    };
    /**
    * Sets a schema configuration
    * @param key name of the configuration option
    * @param value value of the configuration option
    */
    Schema.prototype.set = function (key, value) {
        this.config[key] = value;
    };
    /**
    * Returns the schema configuration
    * @param key name of the configuration option
    */
    Schema.prototype.get = function (key) {
        return this.config[key];
    };
    /**
    * Registers the schema. Creates a mongoose schema and mongoose model.
    */
    Schema.prototype.register = function () {
        this.mongooseSchema = new mongoose_1.Schema(this.schema, this.config);
        this.model = mongoose_1.model(this.name, this.mongooseSchema);
    };
    return Schema;
}());
exports.Schema = Schema;
