"use strict";
exports.__esModule = true;
var model_1 = require("../../components/model");
var chai_1 = require("chai");
var Express = require("express");
//Preconditions
require("./schema.spec");
// import "./method";
// import "./validation";
// import "./permission";
describe("Model", function () {
    var MODEL_NAME = "Sample";
    var model;
    describe("Model class", function () {
        it('should be ok', function () {
            model = new model_1.Model(MODEL_NAME);
        });
        describe('.name', function () {
            it('should be the same', function () {
                chai_1.expect(model.name).to.be.equal(MODEL_NAME);
            });
        });
        describe('.dbname', function () {
            it('should be the pluralized', function () {
                chai_1.expect(model.dbname).to.be.equal("Samples");
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
