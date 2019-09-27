"use strict";
exports.__esModule = true;
var schema_1 = require("../../components/schema");
var chai_1 = require("chai");
describe("Schema", function () {
    var schema;
    describe("#constructor", function () {
        schema = new schema_1.Schema("sample");
        it('should assign a name', function () {
            chai_1.expect(schema["name"]).to.be.equal('sample');
        });
    });
    describe("#virtual", function () {
        beforeEach(function () {
            delete schema["virtuals"].sample;
        });
        it("should be saved in the virtuals", function () {
            var virtualDefinition = {
                get: function () {
                    return this.sample;
                },
                set: function (val) {
                    this.sample = val;
                }
            };
            schema.virtual("sample", virtualDefinition);
            chai_1.expect(schema["virtuals"].sample).to.exist;
            chai_1.expect(schema["virtuals"].sample).to.be.equal(virtualDefinition);
        });
    });
    describe("#set", function () {
        it("should work properly", function () {
            schema.set("test key", "test value");
            chai_1.expect(schema["config"]["test key"]).to.be.equal("test value");
        });
    });
    describe("#get", function () {
        before(function () {
            schema.set("test key", "test value");
        });
        it("should work properly", function () {
            chai_1.expect(schema.get("test key")).to.be.equal("test value");
        });
        it("should return falsy on nonexistent keys values", function () {
            chai_1.expect(schema.get("nonexistent key")).to.not.be.ok;
        });
    });
    describe("#define", function () {
        it("should run properly", function () {
            chai_1.expect(function () {
                schema.define({
                    name: String,
                    age: Number
                }, {
                    "sample config": "config"
                });
            }).to.not["throw"]();
        });
        it("config should be saved", function () {
            chai_1.expect(schema.get("sample config")).to.be.equal("config");
        });
    });
    describe("#register", function () {
        it("should run properly", function () {
            chai_1.expect(function () {
                schema.register();
            }).to.not["throw"]();
        });
        it("should add `mongooseSchema on scope`", function () {
            chai_1.expect(schema.mongooseSchema).to.exist;
        });
        it("should add `model on scope`", function () {
            chai_1.expect(schema.model).to.exist;
        });
    });
});
