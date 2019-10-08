"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var util_1 = require("../../util");
var authentication_1 = require("../../../components/plugins/authentication");
var model_1 = require("../../../components/model");
var index_1 = require("../../../index");
var accessor_1 = require("../../../components/routes/accessor");
var node_mocks_http_1 = require("node-mocks-http");
var sinon_1 = require("sinon");
describe("Authentication Plugin", function () {
    var authPlugin;
    var model;
    before(function () {
        model = new model_1.Model("Super");
        model.define({
            name: String,
            age: Number
        });
        model.Schema.method("hello", function () {
            return { val: "hello" };
        });
        model.Routes.create();
        model.Routes.update();
    });
    describe("#constructor", function () {
        it("should not throw", function () {
            chai_1.expect(function () {
                authPlugin = new authentication_1.AuthenticationPlugin();
                model.install(authPlugin);
            }).to.not["throw"]();
        });
        it("should be a valid global plugin", function () {
            chai_1.expect(authPlugin.name).to.exist;
            chai_1.expect(authPlugin.dependencies).to.exist;
        });
        it('should have #allow function', function () {
            chai_1.expect(authPlugin.allow).to.exist;
        });
        it('should have default endpoint functions', function () {
            chai_1.expect(authPlugin.create).to.exist;
            chai_1.expect(authPlugin.read).to.exist;
            chai_1.expect(authPlugin.update).to.exist;
            chai_1.expect(authPlugin["delete"]).to.exist;
            chai_1.expect(authPlugin.list).to.exist;
        });
        it('should have method and static functions', function () {
            chai_1.expect(authPlugin.method).to.exist;
            chai_1.expect(authPlugin.static).to.exist;
        });
        it('should have `onFail` function', function () {
            chai_1.expect(authPlugin.onFail).to.exist;
        });
        it('should have `failHandler` middleware', function () {
            chai_1.expect(authPlugin.failHandler).to.exist;
        });
        it('should have `authMiddleware` middleware', function () {
            chai_1.expect(authPlugin.authMiddleware).to.exist;
        });
        it('should have `onAuth` function', function () {
            chai_1.expect(authPlugin.onAuth).to.exist;
        });
        it('should have `init` function', function () {
            chai_1.expect(authPlugin.init).to.exist;
        });
    });
    describe("#allow", function () {
        it('should save non-authenticated endpoints in `nonAuth` store ', function () {
            authPlugin.allow("/cats", "GET");
            chai_1.expect(authPlugin.noAuth).to.be.deep.equal([{ endpoint: "/cats", method: "GET" }]);
        });
    });
    describe("Default endpoints", function () {
        describe("CRUD+L operations", function () {
            beforeEach(function () {
                authPlugin.noAuth = [];
            });
            describe("#create", function () {
                it("should add data on `noAuth` store.", function () {
                    authPlugin.create();
                    chai_1.expect(authPlugin.noAuth).to.be.deep.equal([{ endpoint: "/", method: "POST" }]);
                });
            });
            describe("#read", function () {
                it("should add data on `noAuth` store.", function () {
                    authPlugin.read();
                    chai_1.expect(authPlugin.noAuth).to.be.deep.equal([{ endpoint: "/", method: "GET" }]);
                });
            });
            describe("#update", function () {
                it("should add data on `noAuth` store.", function () {
                    authPlugin.update();
                    chai_1.expect(authPlugin.noAuth).to.be.deep.equal([{ endpoint: "/", method: "PUT" }]);
                });
            });
            describe("#list", function () {
                it("should add data on `noAuth` store.", function () {
                    authPlugin.list();
                    chai_1.expect(authPlugin.noAuth).to.be.deep.equal([{ endpoint: "/", method: "LIST" }]);
                });
            });
            describe("#delete", function () {
                it("should add data on `noAuth` store.", function () {
                    authPlugin["delete"]();
                    chai_1.expect(authPlugin.noAuth).to.be.deep.equal([{ endpoint: "/", method: "DELETE" }]);
                });
            });
        });
        describe("Methods and Statics Operation", function () {
            beforeEach(function () {
                authPlugin.noAuth = [];
            });
            it("#method", function () {
                authPlugin.method("hello", "PUT");
                chai_1.expect(authPlugin.noAuth).to.be.deep.equal([{ endpoint: "/do/hello", method: "PUT" }]);
            });
            it("#static", function () {
                authPlugin.static("hello", "LIST");
                chai_1.expect(authPlugin.noAuth).to.be.deep.equal([{ endpoint: "/do/hello", method: "LIST" }]);
            });
        });
    });
    describe("#failHandler", function () {
        var req = node_mocks_http_1.createRequest();
        var res = node_mocks_http_1.createResponse();
        var dispatcher = new accessor_1.Dispatcher(req, res);
        res.tent = dispatcher;
        it('should return status code of `403` whenever the user is unauthenticated.', function (done) {
            util_1.promisify(authPlugin.failHandler, req, res).then(function () {
                try {
                    chai_1.expect(res._getStatusCode()).to.be.equal(403);
                    chai_1.expect(res._getData().error).to.be.equal("Forbidden.");
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
    });
    describe("#authMiddleware", function () {
        var req = node_mocks_http_1.createRequest();
        var res = node_mocks_http_1.createResponse();
        var dispatcher = new accessor_1.Dispatcher(req, res);
        res.tent = dispatcher;
        it('should return status code of `403` whenever the user is unauthenticated.', function (done) {
            util_1.promisify(authPlugin.authMiddleware, req, res).then(function () {
                try {
                    chai_1.expect(res._getStatusCode()).to.be.equal(403);
                    chai_1.expect(res._getData().error).to.be.equal("Forbidden.");
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
        it('should not return status code of `403` whenever the user is authenticated.', function (done) {
            req.tent = { user: true };
            util_1.promisify(authPlugin.authMiddleware, req, res).then(done)["catch"](done);
        });
    });
    describe("#init", function () {
        var AuthModel;
        before(function () {
            index_1.Tent.init({
                "auth user": "AuthModel",
                "auth email token": "email",
                "auth password token": "password",
                "auth secret": "ayiee...tumitingin"
            });
            AuthModel = index_1.Tent.Entity("AuthModel", {
                email: String,
                password: String,
                roles: [String]
            });
            AuthModel.register();
        });
        var spyBuilderCreate;
        var spyBuilderUpdate;
        before(function () {
            spyBuilderCreate = sinon_1.spy(model.Routes.builder("/", "POST"), "pre");
            spyBuilderUpdate = sinon_1.spy(model.Routes.builder("/", "PUT"), "pre");
        });
        it('should not throw', function () {
            chai_1.expect(function () {
                authPlugin.allow("/", "PUT");
                model.register();
            }).to.not["throw"]();
        });
        it('should add jwt middleware', function () {
            chai_1.expect(spyBuilderCreate.calledWith("model")).to.be.equal(true);
            chai_1.expect(spyBuilderUpdate.calledWith("model")).to.be.equal(false);
        });
    });
    describe("#onFail", function () {
        it("should change the default #failHandler middleware.", function () {
            var newFailMiddleware = function (req, res, next) {
                next();
            };
            authPlugin.onFail(newFailMiddleware);
            chai_1.expect(authPlugin.failHandler).to.be.equal(newFailMiddleware);
        });
    });
    describe("#onAuth", function () {
        it("should change the default #authMiddleware middleware", function () {
            var newMiddleware = function (req, res, next) {
                next();
            };
            authPlugin.onAuth(newMiddleware);
            chai_1.expect(authPlugin.authMiddleware).to.be.equal(newMiddleware);
        });
    });
});
