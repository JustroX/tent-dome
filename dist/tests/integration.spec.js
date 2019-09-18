"use strict";
exports.__esModule = true;
var index_1 = require("../index");
var chai_1 = require("chai");
describe("Tent sample run 1.", function () {
    var Tent = new index_1.TentDome();
    var entity;
    it("should initialize properly", function () {
        chai_1.expect(function () {
            Tent.init({
                "mongoose uri": process.env.TEST_MONGODB_URI
            });
        }).to.not["throw"]();
    });
    it("should create new entity", function () {
        entity = Tent.Entity("sample", {
            name: String,
            number: Number,
            list: [{
                    number: Number,
                    text: String,
                    date: { type: Date, "default": Date.now }
                }]
        });
    });
    it("should start properly", function (done) {
        Tent.start().then(function () {
            done();
        })["catch"](done);
    });
    after(function () {
        Tent.AppServer.close();
    });
});
