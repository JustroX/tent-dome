"use strict";
exports.__esModule = true;
var route_1 = require("../../components/route");
var builder_1 = require("../../components/routes/builder");
var middlewares_1 = require("../../components/routes/middlewares");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
//precondition
require("./routes/builder.spec");
describe("Routes", function () {
    describe("#RegisterRoute", function () {
        var route;
        it("should not throw error", function () {
            chai_1.expect(function () {
                route = route_1.RegisterRoute();
            }).to.not["throw"]();
        });
        it("should return a router", function () {
            chai_1.expect(route.name).to.be.equal("router");
        });
    });
    describe("Route Class", function () {
        var route;
        describe("#constructor", function () {
            it("should work properly", function () {
                chai_1.expect(function () {
                    route = new route_1.Routes("SampleRoute");
                }).to.not["throw"]();
            });
            it("name should be saved", function () {
                chai_1.expect(route.name).to.be.equal("SampleRoute");
            });
            it("should create new router", function () {
                chai_1.expect(route.router.name).to.be.equal("router");
            });
        });
        describe("#builder", function () {
            var builder;
            it("should return the builder", function () {
                builder = route.endpoint("sample1", "GET");
                chai_1.expect(route.builder("sample1", "GET")).to.be.equal(builder);
            });
            it("should throw when builder is missing", function () {
                chai_1.expect(function () {
                    route.builder("sample3", "GET");
                }).to["throw"]().property("name", "AssertionError");
            });
        });
        describe("#expose", function () {
            it("should expose the router", function () {
                chai_1.expect(route.expose()).to.be.equal(route.router);
            });
        });
        describe("#endpoint", function () {
            var builder;
            it('should create new builder', function () {
                builder = route.endpoint("sample", "GET");
                chai_1.expect(route.builders.map(function (x) { return x.builder; })).to.include(builder);
            });
            it('should return the builder', function () {
                chai_1.expect(builder).to.be.an["instanceof"](builder_1.Builder);
            });
        });
        describe("#register", function () {
            afterEach(function () {
                route = new route_1.Routes("SampleRoute");
            });
            it('should not throw', function () {
                chai_1.expect(function () {
                    route.register();
                }).to.not["throw"]();
            });
            it('should register LIST', function () {
                var routerSpy = sinon_1.spy(route.router, "get");
                route.endpoint("sample", "LIST").success();
                chai_1.expect(routerSpy.calledWith("sample"));
            });
            it('should register POST', function () {
                var routerSpy = sinon_1.spy(route.router, "post");
                route.endpoint("sample", "POST").success();
                chai_1.expect(routerSpy.calledWith("sample"));
            });
            it('should register GET', function () {
                var routerSpy = sinon_1.spy(route.router, "get");
                route.endpoint("sample", "GET").success();
                chai_1.expect(routerSpy.calledWith("sample/:id"));
            });
            it('should register PUT', function () {
                var routerSpy = sinon_1.spy(route.router, "put");
                route.endpoint("sample", "PUT").success();
                chai_1.expect(routerSpy.calledWith("sample/:id"));
            });
            it('should register DELETE', function () {
                var routerSpy = sinon_1.spy(route.router, "delete");
                route.endpoint("sample", "DELETE").success();
                chai_1.expect(routerSpy.calledWith("sample/:id"));
            });
        });
        describe("Default builders", function () {
            afterEach(function () {
                route.endpoint.restore();
            });
            describe("#create", function () {
                it('should create the proper endpoint', function () {
                    var endpiontSpy = sinon_1.spy(route, "endpoint");
                    var builder = route.create();
                    chai_1.expect(endpiontSpy.calledWith(route.name, "POST"));
                    chai_1.expect(builder.expose().map(function (x) { return x.name; })).to.be.deep.equal([
                        middlewares_1.Middlewares.model("endpoint"),
                        middlewares_1.Middlewares.create(),
                        middlewares_1.Middlewares.sanitize(),
                        middlewares_1.Middlewares.assign(),
                        middlewares_1.Middlewares.save(),
                        middlewares_1.Middlewares.show()
                    ].map(function (x) { return x.name; }));
                });
            });
            describe("#update", function () {
                it('should create the proper endpoint', function () {
                    var endpiontSpy = sinon_1.spy(route, "endpoint");
                    var builder = route.update();
                    chai_1.expect(endpiontSpy.calledWith(route.name, "PUT"));
                    chai_1.expect(builder.expose().map(function (x) { return x.name; })).to.be.deep.equal([
                        middlewares_1.Middlewares.model("endpoint"),
                        middlewares_1.Middlewares.read(),
                        middlewares_1.Middlewares.sanitize(),
                        middlewares_1.Middlewares.assign(),
                        middlewares_1.Middlewares.save(),
                        middlewares_1.Middlewares.show()
                    ].map(function (x) { return x.name; }));
                });
            });
            describe("#read", function () {
                it('should create the proper endpoint', function () {
                    var endpiontSpy = sinon_1.spy(route, "endpoint");
                    var builder = route.read();
                    chai_1.expect(endpiontSpy.calledWith(route.name, "GET"));
                    chai_1.expect(builder.expose().map(function (x) { return x.name; })).to.be.deep.equal([
                        middlewares_1.Middlewares.model("endpoint"),
                        middlewares_1.Middlewares.read(),
                        middlewares_1.Middlewares.show()
                    ].map(function (x) { return x.name; }));
                });
            });
            describe("#list", function () {
                it('should create the proper endpoint', function () {
                    var endpiontSpy = sinon_1.spy(route, "endpoint");
                    var builder = route.list();
                    chai_1.expect(endpiontSpy.calledWith(route.name, "LIST"));
                    chai_1.expect(builder.expose().map(function (x) { return x.name; })).to.be.deep.equal([
                        middlewares_1.Middlewares.model("endpoint"),
                        middlewares_1.Middlewares.param(),
                        middlewares_1.Middlewares.list(),
                        middlewares_1.Middlewares.present()
                    ].map(function (x) { return x.name; }));
                });
            });
            describe("#delete", function () {
                it('should create the proper endpoint', function () {
                    var endpiontSpy = sinon_1.spy(route, "endpoint");
                    var builder = route["delete"]();
                    chai_1.expect(endpiontSpy.calledWith(route.name, "DELETE"));
                    chai_1.expect(builder.expose().map(function (x) { return x.name; })).to.be.deep.equal([
                        middlewares_1.Middlewares.model("endpoint"),
                        middlewares_1.Middlewares.read(),
                        middlewares_1.Middlewares.remove(),
                        middlewares_1.Middlewares.success()
                    ].map(function (x) { return x.name; }));
                });
            });
        });
    });
});
