"use strict";
exports.__esModule = true;
var model_1 = require("../../components/model");
var route_1 = require("../../components/route");
var schema_1 = require("../../components/schema");
var chai_1 = require("chai");
var Express = require("express");
//Preconditions
require("./expand.spec");
require("./schema.spec");
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
            // it('should have an Expand object ',function()
            // {
            // 	expect(model.Expand).to.exist;
            // 	expect(model.Expand).to.be.an.instanceof(Expand);
            // });
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
