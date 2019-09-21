"use strict";
exports.__esModule = true;
var builder_1 = require("../../../components/routes/builder");
var chai_1 = require("chai");
//preconditions
require("./middlewares.spec");
describe("Builder", function () {
    var BUILDER_NAME = "Sample Builder";
    var builder;
    var sample_middleware = function (req, res, next) {
        req.token = true;
        next();
    };
    describe("#constructor", function () {
        it('should not throw', function () {
            chai_1.expect(function () {
                builder = new builder_1.Builder(BUILDER_NAME, { "import builtin": false });
            }).to.not["throw"]();
        });
    });
    describe("#define", function () {
        it('should not throw', function () {
            chai_1.expect(function () {
                builder.define("sample", sample_middleware);
            }).to.not["throw"]();
        });
        it('should create a class function', function () {
            chai_1.expect(builder.sample).to.exist;
        });
        it('should put tag on', function () {
            chai_1.expect(builder.sample.tag).to.be.equal("sample");
        });
        it('should throw when middleware is already defined', function () {
            chai_1.expect(function () {
                builder.define("sample", function () { });
            }).to["throw"]("Builder pipe is already defined");
        });
        describe("#define:sample", function () {
            it('the middlware should be inserted in the head', function () {
                builder.sample();
                chai_1.expect(typeof builder.middlewares[0]).to.be.equal("function");
                chai_1.expect(builder.middlewares[0] === sample_middleware).to.be.equal(true);
            });
            it('head should move', function () {
                builder.sample();
                chai_1.expect(builder.head).to.be.equal(2);
                chai_1.expect(typeof builder.middlewares[1]).to.be.equal("function");
                chai_1.expect(builder.middlewares[1] === sample_middleware).to.be.equal(true);
            });
            it('should return this to enable chaining', function () {
                var a = builder.sample();
                chai_1.expect(a).to.be.equal(builder);
            });
            after(function () {
                builder.middlewares = [];
                builder.head = 0;
            });
        });
    });
    describe("#importBuiltIn", function () {
        it('should not throw', function () {
            chai_1.expect(function () {
                builder.importBuiltIn();
            }).to.not["throw"]();
        });
        it('should import builtin factories', function () {
            chai_1.expect(builder.model).to.exist;
            chai_1.expect(builder.create).to.exist;
            chai_1.expect(builder.save).to.exist;
            chai_1.expect(builder.read).to.exist;
            chai_1.expect(builder.remove).to.exist;
            chai_1.expect(builder.assign).to.exist;
            chai_1.expect(builder.sanitize).to.exist;
            chai_1.expect(builder.param).to.exist;
            chai_1.expect(builder.list).to.exist;
            chai_1.expect(builder.success).to.exist;
            chai_1.expect(builder.show).to.exist;
            chai_1.expect(builder.present).to.exist;
        });
    });
    describe("#custom", function () {
        it('the middlware should be inserted in the head', function () {
            builder.custom(sample_middleware);
            chai_1.expect(typeof builder.middlewares[0]).to.be.equal("function");
            chai_1.expect(builder.middlewares[0] === sample_middleware).to.be.equal(true);
        });
        it('head should move', function () {
            builder.custom(sample_middleware);
            chai_1.expect(builder.head).to.be.equal(2);
            chai_1.expect(typeof builder.middlewares[1]).to.be.equal("function");
            chai_1.expect(builder.middlewares[1] === sample_middleware).to.be.equal(true);
        });
        it('should return this to enable chaining', function () {
            var a = builder.custom(sample_middleware);
            chai_1.expect(a).to.be.equal(builder);
        });
        after(function () {
            builder.middlewares = [];
            builder.head = 0;
        });
    });
    describe("#pointHead", function () {
        before(function () {
            var a = function () { };
            var b = function () { };
            var c = function () { };
            var d = function () { };
            var e = function () { };
            builder.middlewares = [a, b, c, d, e];
        });
        it('should move head into an index', function () {
            builder.pointHead(2);
            chai_1.expect(builder.head).to.be.equal(2);
        });
        it('should throw when index is greater than or equal length', function () {
            chai_1.expect(function () {
                builder.pointHead(5);
            }).to["throw"]("Head index out of range");
            chai_1.expect(builder.head).to.be.equal(2);
        });
        it('should throw when index is less than 0', function () {
            chai_1.expect(function () {
                builder.pointHead(-1);
            }).to["throw"]("Head index out of range");
            chai_1.expect(builder.head).to.be.equal(2);
        });
        after(function () {
            builder.middlewares = [];
            builder.head = 0;
        });
    });
    describe("#lookHead", function () {
        var a = function () { };
        var b = function () { };
        var c = function () { };
        var d = function () { };
        var e = function () { };
        before(function () {
            builder.middlewares = [a, b, c, d, e];
        });
        after(function () {
            builder.middlewares = [];
            builder.head = 0;
        });
        it('should return the middleware', function () {
            builder.pointHead(2);
            chai_1.expect(builder.lookHead()).to.be.equal(c);
        });
    });
    describe("#prevHead", function () {
        before(function () {
            var a = function () { };
            var b = function () { };
            var c = function () { };
            var d = function () { };
            var e = function () { };
            builder.middlewares = [a, b, c, d, e];
        });
        it('should move the head index', function () {
            builder.pointHead(4);
            builder.prevHead();
            chai_1.expect(builder.head).to.be.equal(3);
        });
        it('should throw when index is less than 0', function () {
            chai_1.expect(function () {
                builder.prevHead();
                builder.prevHead();
                builder.prevHead();
                builder.prevHead();
            }).to["throw"]("Head index out of range");
            chai_1.expect(builder.head).to.be.equal(0);
        });
        after(function () {
            builder.middlewares = [];
            builder.head = 0;
        });
    });
    describe("#nexHead", function () {
        before(function () {
            var a = function () { };
            var b = function () { };
            var c = function () { };
            var d = function () { };
            var e = function () { };
            builder.middlewares = [a, b, c, d, e];
        });
        it('should move the head index', function () {
            builder.nextHead();
            chai_1.expect(builder.head).to.be.equal(1);
        });
        it('should throw when index is greater than or equal length', function () {
            chai_1.expect(function () {
                builder.nextHead();
                builder.nextHead();
                builder.nextHead();
                builder.nextHead();
            }).to["throw"]("Head index out of range");
            chai_1.expect(builder.head).to.be.equal(4);
        });
        after(function () {
            builder.middlewares = [];
            builder.head = 0;
        });
    });
    describe("#pre", function () {
        before(function () {
            var a = function () { };
            var b = function b() { };
            var c = function () { };
            var d = function () { };
            var e = function () { };
            b.tag = "b";
            a.tag = "a";
            builder.middlewares = [a, b, c, d, e];
        });
        it('should add new middleware before the tagged one', function () {
            var sample = function sample(req, res, next) { };
            builder.pre("b", sample);
            chai_1.expect(builder.middlewares[1].name).to.be.equal("sample");
            builder.pre("a", sample);
            chai_1.expect(builder.middlewares[0].name).to.be.equal("sample");
        });
        it('should not do anything if tag is missing', function () {
            var sample = function sample(req, res, next) { };
            builder.pre("missing_tag", sample);
            chai_1.expect(builder.middlewares.length).to.be.equal(7);
        });
    });
    describe("#post", function () {
        before(function () {
            var a = function () { };
            var b = function b() { };
            var c = function () { };
            var d = function () { };
            var e = function () { };
            b.tag = "b";
            e.tag = "e";
            builder.middlewares = [a, b, c, d, e];
        });
        it('should add new middleware after the tagged one', function () {
            var sample = function sample(req, res, next) { };
            builder.post("b", sample);
            chai_1.expect(builder.middlewares[2].name).to.be.equal("sample");
            builder.post("e", sample);
            chai_1.expect(builder.middlewares[6].name).to.be.equal("sample");
        });
        it('should not do anything if tag is missing', function () {
            var sample = function sample(req, res, next) { };
            builder.post("missing_tag", sample);
            chai_1.expect(builder.middlewares.length).to.be.equal(7);
        });
    });
    describe("#replaceHead", function () {
        before(function () {
            var a = function () { };
            var b = function b() { };
            var c = function () { };
            var d = function () { };
            var e = function () { };
            builder.middlewares = [a, b, c, d, e];
            builder.head = 4;
        });
        it('should replace value in the head', function () {
            var sample = function sample(req, res, next) { };
            builder.pointHead(2);
            builder.replaceHead(sample);
            chai_1.expect(builder.middlewares[2]).to.be.equal(sample);
        });
    });
    describe("#pop", function () {
        before(function () {
            var a = function () { };
            var b = function b() { };
            var c = function () { };
            var d = function () { };
            var e = function () { };
            b.tag = "c";
            builder.middlewares = [a, b, c, d, e];
            builder.head = 4;
        });
        it('should remove the middleware in the end of `middlewares` array', function () {
            builder.pop();
            chai_1.expect(builder.middlewares.length).to.be.equal(4);
            chai_1.expect(builder.head).to.be.equal(3);
        });
    });
    describe("#expose", function () {
        before(function () {
            var a = function () { };
            var b = function () { };
            var c = function () { };
            var d = function () { };
            var e = function () { };
            builder.middlewares = [a, b, c, d, e];
        });
        it('should return the middlewares', function () {
            var mws = builder.expose();
            chai_1.expect(mws).to.equal(builder.middlewares);
        });
        after(function () {
            builder.middlewares = [];
            builder.head = 0;
        });
    });
});
