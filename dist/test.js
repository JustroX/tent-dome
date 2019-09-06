"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var chai_1 = require("chai");
describe("index", function () {
    describe("Collection()", function () {
        var collection = index_1.Collection();
        it('should return an object', function () {
            chai_1.expect(collection).to.be.an('object');
        });
    });
});
