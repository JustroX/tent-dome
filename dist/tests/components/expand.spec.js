"use strict";
exports.__esModule = true;
var expand_1 = require("../../components/expand");
var chai_1 = require("chai");
describe("Expand", function () {
    var expand;
    describe("#constuctor", function () {
        it("should not throw", function () {
            chai_1.expect(function () {
                expand = new expand_1.Expand();
            }).to.not["throw"]();
        });
        it("should have an empty `populate` store", function () {
            chai_1.expect(expand.populate).to.exist;
            chai_1.expect(expand.populate).to.be.deep.equal({});
        });
        it("should have add function", function () {
            chai_1.expect(expand.add).to.exist;
            chai_1.expect(expand.add).to.be.a("function");
        });
        it("should have expose function", function () {
            chai_1.expect(expand.expose).to.exist;
            chai_1.expect(expand.expose).to.be.a("function");
        });
        it("should have isExpandable function", function () {
            chai_1.expect(expand.isExpandable).to.exist;
            chai_1.expect(expand.isExpandable).to.be.a("function");
        });
    });
    describe("#add", function () {
        it("should save expand on `populate` store", function () {
            chai_1.expect(function () {
                expand.add("comments", "name date");
            }).to.not["throw"]();
            chai_1.expect(expand.populate).to.exist;
            chai_1.expect(expand.populate["comments"]).to.exist;
            chai_1.expect(expand.populate["comments"]).to.be.equal("name date");
        });
    });
    describe("expose", function () {
        it("should expose `populate` store", function () {
            chai_1.expect(expand.expose).to.exist;
            chai_1.expect(expand.expose()).to.be.equal(expand.populate);
        });
    });
    describe("isExpandable", function () {
        it('should return whether field is in `populate` store.', function () {
            chai_1.expect(expand.isExpandable).to.exist;
            chai_1.expect(expand.isExpandable("comments")).to.be.equal(true);
            chai_1.expect(expand.isExpandable("non-existent")).to.be.equal(false);
        });
    });
});
