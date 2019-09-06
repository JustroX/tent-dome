"use strict";
exports.__esModule = true;
var model_1 = require("./components/model");
var server_1 = require("./components/server");
var TentDome = /** @class */ (function () {
    function TentDome() {
        this.AppServer = null;
        this.TentOptions = null;
        this.Models = [];
    }
    TentDome.prototype.init = function (options) {
        this.setDefaultOptions();
        for (var i in options)
            this.TentOptions[i] = options[i];
        this.AppServer = new server_1.Server();
    };
    TentDome.prototype.setDefaultOptions = function () {
        this.set("api prefix", "api");
    };
    /**
     * Setter and Getter functions for the Options
     */
    TentDome.prototype.set = function (key, value) {
        this.TentOptions[key] = value;
    };
    TentDome.prototype.get = function (key) {
        return this.TentOptions[key];
    };
    /**
     * Entity related
     */
    TentDome.prototype.Entity = function (name, schema, config) {
        var model = new model_1.Model(name);
        if (schema)
            model.define(schema, config);
        return model;
    };
    /**
     * Application Server accessors
     */
    TentDome.prototype.start = function (port) {
        if (port === void 0) { port = 7072; }
        model_1.RegisterModels(this.AppServer.app());
        this.AppServer.initDatabase(this.get("mongoose uri"));
        return this.AppServer.start(port);
    };
    TentDome.prototype.server = function () {
        return this.AppServer.server;
    };
    TentDome.prototype.app = function () {
        return this.AppServer.app;
    };
    return TentDome;
}());
exports.TentDome = TentDome;
exports.Tent = new TentDome();
