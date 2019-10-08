"use strict";
exports.__esModule = true;
var index_1 = require("../../../index");
var permission_1 = require("../../../components/plugins/permission");
var authentication_1 = require("../../../components/plugins/authentication");
var accessor_1 = require("../../../components/routes/accessor");
var chai_1 = require("chai");
var util_1 = require("../../util");
var sinon_1 = require("sinon");
var node_mocks_http_1 = require("node-mocks-http");
describe("#Permission", function () {
    var permission;
    var spy;
    describe("#constructor", function () {
        it('should not throw', function () {
            chai_1.expect(function () {
                permission = new permission_1.Permission();
                spy = sinon_1.spy(permission, "endpoint");
            }).to.not["throw"]();
        });
        it('should have `endpoint` function', function () {
            chai_1.expect(permission.endpoint).to.exist;
        });
        it('should have `create` function', function () {
            chai_1.expect(permission.create).to.exist;
        });
        it('should have `read` 	function', function () {
            chai_1.expect(permission.read).to.exist;
        });
        it('should have `list` function', function () {
            chai_1.expect(permission.list).to.exist;
        });
        it('should have `update` function', function () {
            chai_1.expect(permission.update).to.exist;
        });
        it('should have `delete` function', function () {
            chai_1.expect(permission["delete"]).to.exist;
        });
        it('should have `method` function', function () {
            chai_1.expect(permission.method).to.exist;
        });
        it('should have `static` function', function () {
            chai_1.expect(permission.static).to.exist;
        });
        it('should have `init` function', function () {
            chai_1.expect(permission.init).to.exist;
        });
        it('should have `permissionMiddlewareFactory` function', function () {
            chai_1.expect(permission.permissionMiddlewareFactory).to.exist;
        });
    });
    describe("#endpoint", function () {
        it('should have `endpoints` store dictionary.', function () {
            chai_1.expect(permission.endpoints).to.exist;
        });
        it('should save endpoint details on `endpoints` store.', function () {
            permission.endpoint("/sample", "GET", ["bystander"]);
            chai_1.expect(permission.endpoints["/sample-GET"]).to.be.eql({
                endpoint: "/sample",
                method: "GET",
                allow: ["bystander"]
            });
        });
        it('should save endpoint details on `endpoints` store with non array argument', function () {
            permission.endpoint("/sample", "GET", "sample");
            chai_1.expect(permission.endpoints["/sample-GET"]).to.be.eql({
                endpoint: "/sample",
                method: "GET",
                allow: ["bystander", "sample"]
            });
        });
        it('should append role on the `endpoints` store.', function () {
            permission.endpoint("/sample", "GET", ["super"]);
            chai_1.expect(permission.endpoints["/sample-GET"]).to.be.eql({
                endpoint: "/sample",
                method: "GET",
                allow: ["bystander", "sample", "super"]
            });
        });
    });
    describe("#create", function () {
        it('should call `endpoint` with "/" and "POST" arguments ', function () {
            var sampleRole = ["sample"];
            permission.create(sampleRole);
            chai_1.expect(spy.calledWith("/", "POST", sampleRole));
        });
    });
    describe("#read", function () {
        it('should call `endpoint` with "/" and "GET" arguments ', function () {
            var sampleRole = ["sample"];
            permission.read(sampleRole);
            chai_1.expect(spy.calledWith("/", "GET", sampleRole));
        });
    });
    describe("#update", function () {
        it('should call `endpoint` with "/" and "PUT" arguments ', function () {
            var sampleRole = ["sample"];
            permission.update(sampleRole);
            chai_1.expect(spy.calledWith("/", "PUT", sampleRole));
        });
    });
    describe("#delete", function () {
        it('should call `endpoint` with "/" and "DELETE" arguments ', function () {
            var sampleRole = ["sample"];
            permission["delete"](sampleRole);
            chai_1.expect(spy.calledWith("/", "DELETE", sampleRole));
        });
    });
    describe("#list", function () {
        it('should call `endpoint` with "/" and "LIST" arguments ', function () {
            var sampleRole = ["sample"];
            permission.list(sampleRole);
            chai_1.expect(spy.calledWith("/", "LIST", sampleRole));
        });
    });
    describe("#method", function () {
        it('should call `endpoint` with "/do/{method}" and {request method} arguments ', function () {
            var sampleRole = ["sample"];
            permission.method("method", "PUT", sampleRole);
            chai_1.expect(spy.calledWith("/do/method", "PUT", sampleRole));
        });
    });
    describe("#static", function () {
        it('should call `endpoint` with "/do/{static}" and {request method}  arguments ', function () {
            var sampleRole = ["sample"];
            permission.static("static", "LIST", sampleRole);
            chai_1.expect(spy.calledWith("/do/static", "LIST", sampleRole));
        });
    });
    describe("#init", function () {
        var model;
        before(function () {
            permission.endpoints = {};
            model = index_1.Tent.Entity("PermissionAuth", {
                name: String
            });
            model.Routes.create();
            model.Routes.update();
            model.install(new authentication_1.AuthenticationPlugin());
            model.install(permission);
            var perm = model.plugins.permission;
            perm.create(["bystander", "super"]);
        });
        it("should throw when `permission payload role` is not defined ", function () {
            chai_1.expect(function () {
                permission.init();
            }).to["throw"]().property("name", "AssertionError");
        });
        it("should not throw", function () {
            chai_1.expect(function () {
                index_1.Tent.set("permission payload role", "role");
                model.register();
            }).to.not["throw"]();
        });
        it("should add middleware after auth plugin", function () {
            var mw = model.Routes.builder("/", "POST").expose()[3];
            chai_1.expect(mw.tag).to.be.equal("permission");
            chai_1.expect(mw.name).to.be.eql(permission.permissionMiddlewareFactory("/", "POST").name);
        });
    });
    describe("#permissionMiddlewareFactory", function () {
        var req = node_mocks_http_1.createRequest();
        var res = node_mocks_http_1.createResponse();
        var mw;
        before(function () {
            res.tent = new accessor_1.Dispatcher(req, res);
            mw = permission.permissionMiddlewareFactory("/", "POST");
        });
        it("should not allow users with no permission", function (done) {
            util_1.promisify(mw, req, res).then(function () {
                try {
                    chai_1.expect(res._getStatusCode()).to.be.equal(403);
                    done();
                }
                catch (err) {
                    done(err);
                }
                ;
            })["catch"](done);
        });
        it("should not allow users with invalid permissions", function (done) {
            req.user = { role: ["unknownrole"] };
            util_1.promisify(mw, req, res).then(function () {
                try {
                    chai_1.expect(res._getStatusCode()).to.be.equal(403);
                    done();
                }
                catch (err) {
                    done(err);
                }
                ;
            })["catch"](done);
        });
        it("should allow users with valid permissions", function (done) {
            req.user = { role: ["super"] };
            util_1.promisify(mw, req, res).then(function () {
                done();
            })["catch"](done);
        });
    });
});
