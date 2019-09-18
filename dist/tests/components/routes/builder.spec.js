"use strict";
exports.__esModule = true;
var builder_1 = require("../../../components/routes/builder");
var chai_1 = require("chai");
var util_1 = require("../../util");
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
            for (var _i = 0, BUILT_IN_FACTORIES_1 = builder_1.BUILT_IN_FACTORIES; _i < BUILT_IN_FACTORIES_1.length; _i++) {
                var p = BUILT_IN_FACTORIES_1[_i];
                chai_1.expect(builder[p]).to.exist;
            }
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
        util_1.todo();
    });
    describe("#post", function () {
        util_1.todo();
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
