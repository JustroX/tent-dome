"use strict";
exports.__esModule = true;
var sanitation_1 = require("../../../components/plugins/sanitation");
var accessor_1 = require("../../../components/routes/accessor");
var model_1 = require("../../../components/model");
var chai_1 = require("chai");
var node_mocks_http_1 = require("node-mocks-http");
var sinon_1 = require("sinon");
describe("Sanitation Plugin", function () {
    var sanitationPlugin;
    var model;
    before(function () {
        model = new model_1.Model("List");
        model.define({
            whitelist: Number,
            blacklist: Number,
            temp: Number
        });
        model.register();
    });
    describe("#constructor", function () {
        it("should not throw", function () {
            chai_1.expect(function () {
                sanitationPlugin = new sanitation_1.Sanitation();
            }).to.not["throw"]();
        });
        it("should be a valid plugin", function () {
            chai_1.expect(sanitationPlugin.name).to.exist;
            chai_1.expect(sanitationPlugin.dependencies).to.exist;
        });
        it("should have `inbound` and `outbound` scopes", function () {
            chai_1.expect(sanitationPlugin.inbound).to.exist;
            chai_1.expect(sanitationPlugin.outbound).to.exist;
        });
        it("should have `inbound.whitelist` and `outbound.whitelist` scopes", function () {
            chai_1.expect(sanitationPlugin.inbound.whitelist).to.exist;
            chai_1.expect(sanitationPlugin.outbound.whitelist).to.exist;
        });
        it("should have `inbound.blacklist` and `outbound.blacklist` scopes", function () {
            chai_1.expect(sanitationPlugin.inbound.blacklist).to.exist;
            chai_1.expect(sanitationPlugin.outbound.blacklist).to.exist;
        });
        it("should have `inbound.whitelisted` and `outbound.whitelisted` scopes", function () {
            chai_1.expect(sanitationPlugin.inbound.whitelisted).to.exist;
            chai_1.expect(sanitationPlugin.outbound.whitelisted).to.exist;
        });
        it("should have `inbound.blacklisted` and `outbound.blacklisted` scopes", function () {
            chai_1.expect(sanitationPlugin.inbound.blacklisted).to.exist;
            chai_1.expect(sanitationPlugin.outbound.blacklisted).to.exist;
        });
        it("should have `inboundMiddleware` and `outboundMiddleware` scopes", function () {
            chai_1.expect(sanitationPlugin.inboundMiddleware).to.exist;
            chai_1.expect(sanitationPlugin.outboundMiddleware).to.exist;
        });
        it("`outboundMiddleware` and `outboundMiddleware`should have tags", function () {
            chai_1.expect(sanitationPlugin.inboundMiddleware.tag).to.be.equal("inboundSanitation");
            chai_1.expect(sanitationPlugin.outboundMiddleware.tag).to.be.equal("outboundSanitation");
        });
    });
    describe("#inbound.whitelist()", function () {
        it('should add new field in inbound whitelisted', function () {
            sanitationPlugin.inbound.whitelist("sample");
            chai_1.expect(sanitationPlugin.inbound.whitelisted).to.be.deep.equal(["sample"]);
        });
        it('should add new field in inbound whitelisted as arrays', function () {
            sanitationPlugin.inbound.whitelist(["sample1", "sample2"]);
            chai_1.expect(sanitationPlugin.inbound.whitelisted).to.be.deep.equal(["sample", "sample1", "sample2"]);
        });
        it('should throw when blacklisted is not empty', function () {
            sanitationPlugin.inbound.blacklisted = ["sample"];
            chai_1.expect(function () {
                sanitationPlugin.inbound.whitelist("sample");
            }).to["throw"]().property("name", "AssertionError");
        });
    });
    describe("#inbound.blacklist()", function () {
        before(function () {
            sanitationPlugin.inbound.whitelisted = [];
            sanitationPlugin.inbound.blacklisted = [];
        });
        it('should add new field in inbound blacklisted', function () {
            sanitationPlugin.inbound.blacklist("sample");
            chai_1.expect(sanitationPlugin.inbound.blacklisted).to.be.deep.equal(["sample"]);
        });
        it('should add new field in inbound blacklisted as arrays', function () {
            sanitationPlugin.inbound.blacklist(["sample1", "sample2"]);
            chai_1.expect(sanitationPlugin.inbound.blacklisted).to.be.deep.equal(["sample", "sample1", "sample2"]);
        });
        it('should throw when whitelisted is not empty', function () {
            sanitationPlugin.inbound.whitelisted = ["sample"];
            chai_1.expect(function () {
                sanitationPlugin.inbound.whitelist("sample");
            }).to["throw"]().property("name", "AssertionError");
        });
    });
    describe("#outbound.whitelist()", function () {
        it('should add new field in outbound whitelisted', function () {
            sanitationPlugin.outbound.whitelist("sample");
            chai_1.expect(sanitationPlugin.outbound.whitelisted).to.be.deep.equal(["sample"]);
        });
        it('should add new field in outbound whitelisted as arrays', function () {
            sanitationPlugin.outbound.whitelist(["sample1", "sample2"]);
            chai_1.expect(sanitationPlugin.outbound.whitelisted).to.be.deep.equal(["sample", "sample1", "sample2"]);
        });
        it('should throw when blacklisted is not empty', function () {
            sanitationPlugin.outbound.blacklisted = ["sample"];
            chai_1.expect(function () {
                sanitationPlugin.outbound.blacklist("sample");
            }).to["throw"]().property("name", "AssertionError");
        });
    });
    describe("#outbound.blacklist()", function () {
        before(function () {
            sanitationPlugin.outbound.whitelisted = [];
            sanitationPlugin.outbound.blacklisted = [];
        });
        it('should add new field in outbound blacklisted', function () {
            sanitationPlugin.outbound.blacklist("sample");
            chai_1.expect(sanitationPlugin.outbound.blacklisted).to.be.deep.equal(["sample"]);
        });
        it('should add new field in outbound blacklisted as arrays', function () {
            sanitationPlugin.outbound.blacklist(["sample1", "sample2"]);
            chai_1.expect(sanitationPlugin.outbound.blacklisted).to.be.deep.equal(["sample", "sample1", "sample2"]);
        });
        it('should throw when whitelisted is not empty', function () {
            sanitationPlugin.outbound.whitelisted = ["sample"];
            chai_1.expect(function () {
                sanitationPlugin.outbound.blacklist("sample");
            }).to["throw"]().property("name", "AssertionError");
        });
    });
    describe("#inboundMiddleware", function () {
        var req = node_mocks_http_1.createRequest();
        var res = node_mocks_http_1.createResponse();
        beforeEach(function () {
            sanitationPlugin.inbound.blacklisted = [];
            sanitationPlugin.inbound.whitelisted = [];
            req.body =
                {
                    whitelist: 1,
                    blacklist: 2,
                    temp: 3
                };
        });
        it('should whitelist', function (done) {
            sanitationPlugin.inbound.whitelist("whitelist");
            sanitationPlugin.inboundMiddleware()(req, res, function () {
                try {
                    chai_1.expect(req.body).to.be.deep.equal({ whitelist: 1 });
                    done();
                }
                catch (err) {
                    done(err);
                }
            });
        });
        it('should blacklist', function (done) {
            sanitationPlugin.inbound.blacklist("blacklist");
            sanitationPlugin.inboundMiddleware()(req, res, function () {
                try {
                    chai_1.expect(req.body).to.be.deep.equal({ whitelist: 1, temp: 3 });
                    done();
                }
                catch (err) {
                    done(err);
                }
            });
        });
    });
    describe("#outboundMiddleware", function () {
        var req = node_mocks_http_1.createRequest();
        var res = node_mocks_http_1.createResponse();
        before(function () {
            req.body =
                {
                    whitelist: 1,
                    blacklist: 2,
                    temp: 3
                };
            req.tent = new accessor_1.Accessor(req, res);
            req.tent.Model("List");
            req.tent.FreshDocument();
            req.tent.payload = req.body;
            req.tent.Assign();
        });
        beforeEach(function () {
            req.body =
                {
                    whitelist: 1,
                    blacklist: 2,
                    temp: 3
                };
            sanitationPlugin.outbound.blacklisted = [];
            sanitationPlugin.outbound.whitelisted = [];
            req.tent.FreshDocument();
            req.tent.Sanitize(req.body);
            req.tent.Assign();
        });
        it('should whitelist', function (done) {
            sanitationPlugin.outbound.whitelist("whitelist");
            sanitationPlugin.outboundMiddleware()(req, res, function () {
                try {
                    var document_1 = req.tent.document;
                    chai_1.expect(document_1.whitelist).to.be.equal(1);
                    done();
                }
                catch (err) {
                    done(err);
                }
            });
        });
        it('should blacklist', function (done) {
            sanitationPlugin.outbound.blacklist("blacklist");
            sanitationPlugin.outboundMiddleware()(req, res, function () {
                try {
                    var document_2 = req.tent.document;
                    chai_1.expect(document_2.whitelist).to.be.equal(1);
                    chai_1.expect(document_2.temp).to.be.equal(3);
                    done();
                }
                catch (err) {
                    done(err);
                }
            });
        });
        it('should whitelist lists', function (done) {
            req.tent.list =
                [
                    req.tent.document,
                ];
            sanitationPlugin.outbound.whitelist("whitelist");
            sanitationPlugin.outboundMiddleware()(req, res, function () {
                try {
                    console.log;
                    var list = req.tent.list;
                    chai_1.expect(list[0].whitelist).to.be.equal(1);
                    done();
                }
                catch (err) {
                    done(err);
                }
            });
        });
        it('should blacklist lists', function (done) {
            req.tent.list =
                [
                    req.tent.document,
                ];
            sanitationPlugin.outbound.blacklist("blacklist");
            sanitationPlugin.outboundMiddleware()(req, res, function () {
                try {
                    var list = req.tent.list;
                    chai_1.expect(list[0].whitelist).to.be.equal(1);
                    chai_1.expect(list[0].temp).to.be.equal(3);
                    done();
                }
                catch (err) {
                    done(err);
                }
            });
        });
    });
    describe("#init", function () {
        var modelPostSpy;
        var modelPutSpy;
        var modelGetSpy;
        var modelListSpy;
        var middlewareInboundSpy;
        var middlewareOutboundSpy;
        before(function () {
            model = new model_1.Model("List2");
            model.install(sanitationPlugin);
            model.Routes.create();
            model.Routes.update();
            model.Routes.read();
            model.Routes.list();
            model.Routes["delete"]();
            modelPostSpy = sinon_1.spy(model.Routes.builder("/", "POST"), "post");
            modelPutSpy = sinon_1.spy(model.Routes.builder("/", "PUT"), "post");
            modelGetSpy = sinon_1.spy(model.Routes.builder("/", "GET"), "pre");
            modelListSpy = sinon_1.spy(model.Routes.builder("/", "LIST"), "pre");
            middlewareInboundSpy = sinon_1.spy(sanitationPlugin, "inboundMiddleware");
            middlewareOutboundSpy = sinon_1.spy(sanitationPlugin, "outboundMiddleware");
            model.register();
        });
        it("should add inbound middleware on methods `POST` and `PUT` after `model` middleware", function () {
            var inboundSpy = sinon_1.spy();
            chai_1.expect(modelPostSpy.args[0][0] == "model").to.be.equal(true);
            chai_1.expect(modelPutSpy.args[0][0] == "model").to.be.equal(true);
            chai_1.expect(modelPostSpy.args[0][1]).to.be.a("function");
            chai_1.expect(modelPutSpy.args[0][1]).to.be.a("function");
            chai_1.expect(middlewareInboundSpy.callCount).to.be.equal(2);
        });
        it("should add outbound middleware on methods `GET` before `present` and `show` middleware", function () {
            chai_1.expect(modelGetSpy.args[0][0] == "show").to.be.equal(true);
            chai_1.expect(modelListSpy.args[0][0] == "present").to.be.equal(true);
            chai_1.expect(modelGetSpy.args[0][1]).to.a("function");
            chai_1.expect(modelListSpy.args[0][1]).to.a("function");
            chai_1.expect(middlewareOutboundSpy.callCount).to.be.equal(2);
        });
    });
});
