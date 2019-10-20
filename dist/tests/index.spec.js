"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var Tent = __importStar(require("../index"));
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
