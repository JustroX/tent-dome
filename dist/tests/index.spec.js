"use strict";
exports.__esModule = true;
var Tent = require("../index");
var chai_1 = require("chai");
require("./tent.spec");
describe("Tent Module", function () {
    it("Tent should be available", function () {
        chai_1.expect(Tent.Tent).to.exist;
    });
    it("Plugin should be available", function () {
        chai_1.expect(Tent.Plugin).to.exist;
    });
    it("Route should be available", function () {
        chai_1.expect(Tent.Route).to.exist;
    });
    it("Sanitation Plugin should be available", function () {
        chai_1.expect(Tent.Sanitation).to.exist;
    });
    it("Validation Plugin should be available", function () {
        chai_1.expect(Tent.Validation).to.exist;
    });
    it("Types should be available", function () {
        chai_1.expect(Tent.Types).to.exist;
    });
    it("TentDome should be available", function () {
        chai_1.expect(Tent.TentDome).to.exist;
    });
});
