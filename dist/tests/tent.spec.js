"use strict";
exports.__esModule = true;
var index_1 = require("../index");
var model_1 = require("../components/model");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var dotenv_1 = require("dotenv");
dotenv_1.config();
//preconditions
require("./components/server.spec");
require("./components/model.spec");
describe("Tent", function () {
    describe("Tent", function () {
        var Tent = new index_1.TentDome();
        it('should return an object', function () {
            chai_1.expect(Tent).to.be.an('object');
        });
    });
    describe("Tent set()", function () {
        var Tent = new index_1.TentDome();
        it('should equal TentOptions', function () {
            Tent.set('sample string', 'hello');
            Tent.set('sample number', 123);
            chai_1.expect(Tent.TentOptions["sample string"]).to.equal('hello');
            chai_1.expect(Tent.TentOptions["sample number"]).to.equal(123);
        });
        it('should replace previous TentOptions', function () {
            Tent.set('sample string', 'world');
            Tent.set('sample number', 234);
            chai_1.expect(Tent.TentOptions["sample string"]).to.equal('world');
            chai_1.expect(Tent.TentOptions["sample number"]).to.equal(234);
        });
    });
    describe("Tent get()", function () {
        var Tent = new index_1.TentDome();
        Tent.set('sample string', 'hello');
        Tent.set('sample number', 123);
        it('should equal TentOptions', function () {
            chai_1.expect(Tent.get('sample string')).to.equal('hello');
            chai_1.expect(Tent.get('sample number')).to.equal(123);
        });
    });
    describe("#setDefaultOptions()", function () {
        var Tent = new index_1.TentDome();
        it('should have default options', function () {
            Tent.setDefaultOptions();
            chai_1.expect(Tent.TentOptions["api prefix"]).to.equal('api');
        });
    });
    describe("#init()", function () {
        var Tent = new index_1.TentDome();
        it('should have default options', function () {
            Tent.init({});
            chai_1.expect(Tent.TentOptions["api prefix"]).to.equal('api');
        });
        after(function () {
            Tent.AppServer.close();
        });
    });
    describe("#Entity", function () {
        var Tent = new index_1.TentDome();
        it('should return proper model', function () {
            var model = Tent.Entity("sample", { name: String });
            chai_1.expect(model).to.be["instanceof"](model_1.Model);
        });
    });
    describe("#install", function () {
        var Tent = new index_1.TentDome();
        var samplePlugin = { initGlobal: function () { }, name: "sample", dependencies: [] };
        it("should save plugin on `plugins` store plugin", function () {
            Tent.install(samplePlugin);
            chai_1.expect(Tent.plugins.sample).to.exist;
        });
    });
    describe("#register", function () {
        var Tent = new index_1.TentDome();
        var samplePlugin = { initGlobal: function () { }, name: "sample", dependencies: [] };
        var pluginSpy = sinon_1.spy(samplePlugin, "initGlobal");
        Tent.install(samplePlugin);
        it('should throw when namespace is unavailable', function () {
            chai_1.expect(function () {
                Tent.install(samplePlugin);
            });
        });
        it("should call `initGlobal` of the plugin", function () {
            Tent.register();
            chai_1.expect(pluginSpy.calledOnce).to.be.equal(true);
        });
        it("should add `app`", function () {
            chai_1.expect(samplePlugin.app).to.be.equal(Tent.app());
        });
    });
    describe("#start", function () {
        var Tent = new index_1.TentDome();
        var model = Tent.Entity("sample", { name: String });
        Tent.init({
            "mongodb uri": process.env.TEST_MONGODB_URI
        });
        it('should not throw any error', function () {
            chai_1.expect(function () {
                Tent.start();
            }).to.not["throw"]();
        });
        after(function () {
            Tent.AppServer.close();
        });
    });
    describe("#server", function () {
        var Tent = new index_1.TentDome();
        it('should return tent server', function () {
            chai_1.expect(Tent.server()).to.be.equal(Tent.AppServer.server);
        });
    });
    describe("#app", function () {
        var Tent = new index_1.TentDome();
        it('should return tent app', function () {
            chai_1.expect(Tent.app()).to.be.equal(Tent.AppServer.app);
        });
    });
});
//built-in plugins
require("./components/plugins/sanitation.spec");
require("./components/plugins/validation.spec");
require("./components/plugins/authentication.spec");
// //integration without plugins
// import "./integration.spec";
