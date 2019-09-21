"use strict";
exports.__esModule = true;
var index_1 = require("../index");
var schema_1 = require("./schema");
var route_1 = require("./route");
var method_1 = require("./method");
var expand_1 = require("./expand");
var pluralize = require("pluralize");
var Assert = require("assert");
var Models = {};
function get(name) {
    return Models[name];
}
exports.get = get;
function RegisterModels(app) {
    app.use("/" + index_1.Tent.get("api prefix"), route_1.RegisterRoute());
    for (var name_1 in Models) {
        var model = Models[name_1];
        app.use("/" + index_1.Tent.get("api prefix") + "/" + model.dbname, model.Routes.expose());
    }
}
exports.RegisterModels = RegisterModels;
var Model = /** @class */ (function () {
    function Model(name) {
        this.plugins = {};
        this.name = name;
        this.dbname = pluralize(name);
        this.Routes = new route_1.Routes(this.name);
        this.Schema = new schema_1.Schema(name);
        this.Method = new method_1.Method();
        this.Expand = new expand_1.Expand();
    }
    Model.prototype.define = function (schema, config) {
        if (config === void 0) { config = {}; }
        this.Schema.define(schema, config);
    };
    Model.prototype.register = function () {
        this.Schema.register();
        this.Method.register();
        this.Routes.register();
        Models[this.name] = this;
    };
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
