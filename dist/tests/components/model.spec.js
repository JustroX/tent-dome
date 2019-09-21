"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var model_1 = require("../../components/model");
var route_1 = require("../../components/route");
var expand_1 = require("../../components/expand");
var schema_1 = require("../../components/schema");
var plugin_1 = require("../../components/plugin");
var chai_1 = require("chai");
var Express = require("express");
//Preconditions
require("./expand.spec");
require("./schema.spec");
require("./plugin.spec");
describe("Model", function () {
    var MODEL_NAME = "Sample";
    var model;
    describe("Model class", function () {
        describe('constructor', function () {
            it("should not throw", function () {
                chai_1.expect(function () {
                    model = new model_1.Model(MODEL_NAME);
                }).to.not["throw"]();
            });
            it("should have .name", function () {
                chai_1.expect(model.name).to.exist;
            });
            it('name should be the same', function () {
                chai_1.expect(model.name).to.be.equal(MODEL_NAME);
            });
            it('should have .dbname', function () {
                chai_1.expect(model.dbname).to.exist;
            });
            it('dbname should be the pluralized', function () {
                chai_1.expect(model.dbname).to.be.equal("Samples");
            });
            it('should have a Route object ', function () {
                chai_1.expect(model.Routes).to.exist;
                chai_1.expect(model.Routes).to.be.an["instanceof"](route_1.Routes);
            });
            it('should have a Schema object ', function () {
                chai_1.expect(model.Schema).to.exist;
                chai_1.expect(model.Schema).to.be.an["instanceof"](schema_1.Schema);
            });
            it('should have an Expand object ', function () {
                chai_1.expect(model.Expand).to.exist;
                chai_1.expect(model.Expand).to.be.an["instanceof"](expand_1.Expand);
            });
            it('should have an 	`install()` function', function () {
                chai_1.expect(model.install).to.exist;
                chai_1.expect(model.install).to.be.a('function');
            });
            it('should have a `plugins` store', function () {
                chai_1.expect(model.plugins).to.exist;
                chai_1.expect(model.plugins).to.be.deep.equal({});
            });
        });
        describe('#define', function () {
            it("should not throw error", function () {
                chai_1.expect(function () {
                    model.define({
                        name: String,
                        age: Number
                    }, {
                        "test config": "test value"
                    });
                }).to.not["throw"]();
            });
        });
        describe('#register', function () {
            it('should not throw error', function () {
                chai_1.expect(function () {
                    model.register();
                }).to.not["throw"]();
            });
        });
        describe("#install", function () {
            it('should throw if invalid plugin', function () {
                var SamplePlugin = /** @class */ (function () {
                    function SamplePlugin() {
                    }
                    return SamplePlugin;
                }());
                chai_1.expect(function () {
                    model.install(new SamplePlugin());
                }).to["throw"]().property("name", "AssertionError");
            });
            it('should throw if already installed', function () {
                var SamplePlugin = /** @class */ (function () {
                    function SamplePlugin() {
                    }
                    SamplePlugin.prototype.init = function () { };
                    SamplePlugin = __decorate([
                        plugin_1.Plugin({
                            name: "sample",
                            dependencies: []
                        })
                    ], SamplePlugin);
                    return SamplePlugin;
                }());
                model.plugins["sample"] = { name: "sample", dependencies: [], init: function () { } };
                chai_1.expect(function () {
                    model.install(new SamplePlugin());
                }).to["throw"]().property("name", "AssertionError");
            });
            it('should throw if dependency is not installed', function () {
                var SamplePlugin = /** @class */ (function () {
                    function SamplePlugin() {
                    }
                    SamplePlugin.prototype.init = function () { };
                    SamplePlugin = __decorate([
                        plugin_1.Plugin({
                            name: "sample",
                            dependencies: ["unavailable"]
                        })
                    ], SamplePlugin);
                    return SamplePlugin;
                }());
                chai_1.expect(function () {
                    model.install(new SamplePlugin());
                }).to["throw"]().property("name", "AssertionError");
            });
            it('should not throw', function () {
                delete model.plugins["sample"];
                var SamplePlugin = /** @class */ (function () {
                    function SamplePlugin() {
                    }
                    SamplePlugin.prototype.init = function () { };
                    SamplePlugin = __decorate([
                        plugin_1.Plugin({
                            name: "sample",
                            dependencies: []
                        })
                    ], SamplePlugin);
                    return SamplePlugin;
                }());
                chai_1.expect(function () {
                    model.install(new SamplePlugin());
                }).to.not["throw"]();
            });
            it('.plugins.pluginName must be exposed.', function () {
                delete model.plugins["sample"];
                if (!model["sample"])
                    model["sample"] = undefined;
                var SamplePlugin = /** @class */ (function () {
                    function SamplePlugin() {
                    }
                    SamplePlugin.prototype.init = function () { };
                    SamplePlugin = __decorate([
                        plugin_1.Plugin({
                            name: "sample",
                            dependencies: []
                        })
                    ], SamplePlugin);
                    return SamplePlugin;
                }());
                model.install(new SamplePlugin());
                chai_1.expect(model.plugins["sample"]).to.be.an["instanceof"](SamplePlugin);
            });
        });
    });
    describe("#RegisterModels", function () {
        var app;
        before(function () {
            app = Express();
        });
        it('should not throw', function () {
            chai_1.expect(function () {
                model_1.RegisterModels(app);
            }).to.not["throw"]();
        });
    });
    describe("#get", function () {
        it('should be saved on model store dictionary', function () {
            chai_1.expect(model_1.get(MODEL_NAME)).to.be.equal(model);
        });
    });
});
require("./routes.spec");
