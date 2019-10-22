"use strict";
exports.__esModule = true;
var validation_1 = require("../../../components/plugins/validation");
var accessor_1 = require("../../../components/routes/accessor");
var model_1 = require("../../../components/model");
var chai_1 = require("chai");
var util_1 = require("../../util");
var node_mocks_http_1 = require("node-mocks-http");
var sinon_1 = require("sinon");
// import Joi = require("@hapi/joi");
var Joi = require("@hapi/joi");
describe("Validation Plugin", function () {
    var validationPlugin;
    describe("#constructor", function () {
        it('should not throw', function () {
            chai_1.expect(function () {
                validationPlugin = new validation_1.Validation();
            }).to.not["throw"]();
        });
        it("should be a valid plugin", function () {
            chai_1.expect(validationPlugin.name).to.exist;
            chai_1.expect(validationPlugin.dependencies).to.exist;
            chai_1.expect(validationPlugin.init).to.exist;
        });
        it("should have a `joi` member", function () {
            chai_1.expect(validationPlugin.joi).to.exist;
            chai_1.expect(validationPlugin.joi).to.be.equal(Joi);
        });
        it("should have `definition` member", function () {
            chai_1.expect(validationPlugin.definition).to.exist;
            chai_1.expect(validationPlugin.definition).to.be.deep.equal({});
        });
        it("should have `constraint` member", function () {
            chai_1.expect(validationPlugin.constraints).to.exist;
            chai_1.expect(validationPlugin.constraints).to.be.deep.equal({
                and: { peers: [], options: {} },
                nand: { peers: [], options: {} },
                oxor: { peers: [], options: {} },
                or: { peers: [], options: {} },
                xor: { peers: [], options: {} },
                "with": {},
                without: {}
            });
        });
        it("should have `schema` method", function () {
            chai_1.expect(validationPlugin.schema).to.exist;
            chai_1.expect(validationPlugin.schema).to.be.a('function');
        });
        it("should have `validationMiddleware` method", function () {
            chai_1.expect(validationPlugin.validationMiddleware).to.exist;
            chai_1.expect(validationPlugin.validationMiddleware).to.be.a('function');
        });
        it("should have `onFail` method", function () {
            chai_1.expect(validationPlugin.onFail).to.exist;
            chai_1.expect(validationPlugin.onFail).to.be.a('function');
        });
        it("should have `onFailMiddlewareFactory` method", function () {
            chai_1.expect(validationPlugin.onFailMiddlewareFactory).to.exist;
            chai_1.expect(validationPlugin.onFailMiddlewareFactory).to.be.a('function');
        });
    });
    describe("#schema", function () {
        var peerConstaints;
        it('should save schema to `definition`', function () {
            var a = {
                name: Joi.string().alphanum().min(2).max(3).required(),
                age: Joi.number().min(18).max(22).required()
            };
            peerConstaints = validationPlugin.schema(a);
            chai_1.expect(validationPlugin.definition).to.be.equal(a);
        });
        it('should return  a ConstraintUtility', function () {
            chai_1.expect(peerConstaints).to.be.an["instanceof"](validation_1.ConstraintUtility);
        });
        describe("ConstraintUtility", function () {
            describe("constructor", function () {
                it('should have all peer related joi.Object functions', function () {
                    chai_1.expect(peerConstaints.parent).to.exist;
                    chai_1.expect(peerConstaints.and).to.exist;
                    chai_1.expect(peerConstaints.nand).to.exist;
                    chai_1.expect(peerConstaints.or).to.exist;
                    chai_1.expect(peerConstaints.oxor).to.exist;
                    chai_1.expect(peerConstaints["with"]).to.exist;
                    chai_1.expect(peerConstaints.without).to.exist;
                    chai_1.expect(peerConstaints.xor).to.exist;
                    chai_1.expect(peerConstaints.and).to.be.a('function');
                    chai_1.expect(peerConstaints.nand).to.be.a('function');
                    chai_1.expect(peerConstaints.or).to.be.a('function');
                    chai_1.expect(peerConstaints.oxor).to.be.a('function');
                    chai_1.expect(peerConstaints["with"]).to.be.a('function');
                    chai_1.expect(peerConstaints.without).to.be.a('function');
                    chai_1.expect(peerConstaints.xor).to.be.a('function');
                });
            });
            describe("#and", function () {
                it('should save on constraints', function () {
                    peerConstaints.and("one", "two", "three");
                    chai_1.expect(validationPlugin.constraints).to.exist;
                    chai_1.expect(validationPlugin.constraints.and).to.exist;
                    chai_1.expect(validationPlugin.constraints.and.peers).to.exist;
                    chai_1.expect(validationPlugin.constraints.and.peers).to.be.eql([["one", "two", "three"]]);
                });
                it('should append new constraints', function () {
                    peerConstaints.and("one", "two", "three");
                    chai_1.expect(validationPlugin.constraints.and.peers).to.be.eql([["one", "two", "three"], ["one", "two", "three"]]);
                });
                it('should append new constraints and add options', function () {
                    var options = { sample: 3 };
                    peerConstaints.and("one", "two", "three", options);
                    chai_1.expect(validationPlugin.constraints.and.peers).to.be.eql([["one", "two", "three"], ["one", "two", "three"], ["one", "two", "three"]]);
                    chai_1.expect(validationPlugin.constraints.and.options).to.be.eql(options);
                });
            });
            describe("#nand", function () {
                it('should save on constraints', function () {
                    peerConstaints.nand("one", "two", "three");
                    chai_1.expect(validationPlugin.constraints).to.exist;
                    chai_1.expect(validationPlugin.constraints.nand).to.exist;
                    chai_1.expect(validationPlugin.constraints.nand.peers).to.exist;
                    chai_1.expect(validationPlugin.constraints.nand.peers).to.be.eql([["one", "two", "three"]]);
                });
                it('should append new constraints', function () {
                    peerConstaints.nand("one", "two", "three");
                    chai_1.expect(validationPlugin.constraints.nand.peers).to.be.eql([["one", "two", "three"], ["one", "two", "three"]]);
                });
                it('should append new constraints and add options', function () {
                    var options = { sample: 3 };
                    peerConstaints.nand("one", "two", "three", options);
                    chai_1.expect(validationPlugin.constraints.nand.peers).to.be.eql([["one", "two", "three"], ["one", "two", "three"], ["one", "two", "three"]]);
                    chai_1.expect(validationPlugin.constraints.nand.options).to.be.eql(options);
                });
            });
            describe("#or", function () {
                it('should save on constraints', function () {
                    peerConstaints.or("one", "two", "three");
                    chai_1.expect(validationPlugin.constraints).to.exist;
                    chai_1.expect(validationPlugin.constraints.or).to.exist;
                    chai_1.expect(validationPlugin.constraints.or.peers).to.exist;
                    chai_1.expect(validationPlugin.constraints.or.peers).to.be.eql([["one", "two", "three"]]);
                });
                it('should append new constraints', function () {
                    peerConstaints.or("one", "two", "three");
                    chai_1.expect(validationPlugin.constraints.or.peers).to.be.eql([["one", "two", "three"], ["one", "two", "three"]]);
                });
                it('should append new constraints and add options', function () {
                    var options = { sample: 3 };
                    peerConstaints.or("one", "two", "three", options);
                    chai_1.expect(validationPlugin.constraints.or.peers).to.be.eql([["one", "two", "three"], ["one", "two", "three"], ["one", "two", "three"]]);
                    chai_1.expect(validationPlugin.constraints.or.options).to.be.eql(options);
                });
            });
            describe("#oxor", function () {
                it('should save on constraints', function () {
                    peerConstaints.oxor("one", "two", "three");
                    chai_1.expect(validationPlugin.constraints).to.exist;
                    chai_1.expect(validationPlugin.constraints.oxor).to.exist;
                    chai_1.expect(validationPlugin.constraints.oxor.peers).to.exist;
                    chai_1.expect(validationPlugin.constraints.oxor.peers).to.be.eql([["one", "two", "three"]]);
                });
                it('should append new constraints', function () {
                    peerConstaints.oxor("one", "two", "three");
                    chai_1.expect(validationPlugin.constraints.oxor.peers).to.be.eql([["one", "two", "three"], ["one", "two", "three"]]);
                });
                it('should append new constraints and add options', function () {
                    var options = { sample: 3 };
                    peerConstaints.oxor("one", "two", "three", options);
                    chai_1.expect(validationPlugin.constraints.oxor.peers).to.be.eql([["one", "two", "three"], ["one", "two", "three"], ["one", "two", "three"]]);
                    chai_1.expect(validationPlugin.constraints.oxor.options).to.be.eql(options);
                });
            });
            describe("#with", function () {
                it('should save on constraints', function () {
                    peerConstaints["with"]("one", "three");
                    chai_1.expect(validationPlugin.constraints).to.exist;
                    chai_1.expect(validationPlugin.constraints["with"]).to.exist;
                    chai_1.expect(validationPlugin.constraints["with"].one).to.exist;
                    chai_1.expect(validationPlugin.constraints["with"].one).to.be.eql({ options: {}, peers: ["three"] });
                });
                it('should append new constraints', function () {
                    peerConstaints["with"]("one", "two");
                    chai_1.expect(validationPlugin.constraints["with"].one).to.be.eql({ options: {}, peers: ["three", "two"] });
                });
                it('should append new constraints list', function () {
                    peerConstaints["with"]("one", ["one", "zero"]);
                    chai_1.expect(validationPlugin.constraints["with"].one).to.be.eql({ options: {}, peers: ["three", "two", "one", "zero"] });
                });
                it('should append new constraints and add options', function () {
                    var options = { sample: 3 };
                    peerConstaints["with"]("one", "pi", options);
                    chai_1.expect(validationPlugin.constraints["with"].one).to.be.eql({ options: options, peers: ["three", "two", "one", "zero", "pi"] });
                });
                it('should append new constraints list and add options', function () {
                    delete validationPlugin.constraints["with"].one.options;
                    var options = { sample: 3 };
                    peerConstaints["with"]("one", ["pi", "-1/12"], options);
                    chai_1.expect(validationPlugin.constraints["with"].one).to.be.eql({ options: options, peers: ["three", "two", "one", "zero", "pi", "pi", "-1/12"] });
                });
            });
            describe("#without", function () {
                it('should save on constraints', function () {
                    peerConstaints.without("one", "three");
                    chai_1.expect(validationPlugin.constraints).to.exist;
                    chai_1.expect(validationPlugin.constraints.without).to.exist;
                    chai_1.expect(validationPlugin.constraints.without.one).to.exist;
                    chai_1.expect(validationPlugin.constraints.without.one).to.be.eql({ options: {}, peers: ["three"] });
                });
                it('should append new constraints', function () {
                    peerConstaints.without("one", "two");
                    chai_1.expect(validationPlugin.constraints.without.one).to.be.eql({ options: {}, peers: ["three", "two"] });
                });
                it('should append new constraints list', function () {
                    peerConstaints.without("one", ["one", "zero"]);
                    chai_1.expect(validationPlugin.constraints.without.one).to.be.eql({ options: {}, peers: ["three", "two", "one", "zero"] });
                });
                it('should append new constraints and add options', function () {
                    var options = { sample: 3 };
                    peerConstaints.without("one", "pi", options);
                    chai_1.expect(validationPlugin.constraints.without.one).to.be.eql({ peers: ["three", "two", "one", "zero", "pi"], options: options });
                });
                it('should append new constraints list and add options', function () {
                    delete validationPlugin.constraints.without.one.options;
                    var options = { sample: 3 };
                    peerConstaints.without("one", ["pi", "-1/12"], options);
                    chai_1.expect(validationPlugin.constraints.without.one).to.be.eql({ peers: ["three", "two", "one", "zero", "pi", "pi", "-1/12"], options: options });
                });
            });
            describe("#xor", function () {
                it('should save on constraints', function () {
                    peerConstaints.xor("one", "two", "three");
                    chai_1.expect(validationPlugin.constraints).to.exist;
                    chai_1.expect(validationPlugin.constraints.xor).to.exist;
                    chai_1.expect(validationPlugin.constraints.xor.peers).to.exist;
                    chai_1.expect(validationPlugin.constraints.xor.peers).to.be.eql([["one", "two", "three"]]);
                });
                it('should append new constraints', function () {
                    peerConstaints.xor("one", "two", "three");
                    chai_1.expect(validationPlugin.constraints.xor.peers).to.be.eql([["one", "two", "three"], ["one", "two", "three"]]);
                });
                it('should append new constraints and add options', function () {
                    var options = { sample: 3 };
                    peerConstaints.xor("one", "two", "three", options);
                    chai_1.expect(validationPlugin.constraints.xor.peers).to.be.eql([["one", "two", "three"], ["one", "two", "three"], ["one", "two", "three"]]);
                    chai_1.expect(validationPlugin.constraints.xor.options).to.be.eql(options);
                });
            });
        });
    });
    describe("#onFailMiddlewareFactory", function () {
        var mw;
        var req = node_mocks_http_1.createRequest();
        var res = node_mocks_http_1.createResponse();
        before(function () {
            req.tent = new accessor_1.Accessor(req, res);
            res.tent = new accessor_1.Dispatcher(req, res);
            req.tent.plugins.validation = {};
        });
        it('should return a middleware that will be called when validation fails', function () {
            mw = validationPlugin.onFailMiddlewareFactory();
            chai_1.expect(mw).to.be.a('function');
        });
        it('should respond 400 - ValidationError`', function (done) {
            req.tent.plugins.validation.error = { details: [{ message: "try" }] };
            util_1.promisify(mw, req, res).then(function () {
                try {
                    chai_1.expect(res._getStatusCode()).to.be.equal(400);
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
        after(function () {
            delete req.tent.plugins.validation;
        });
    });
    describe("#validationMiddleware factory", function () {
        var mw;
        var req = node_mocks_http_1.createRequest();
        var res = node_mocks_http_1.createResponse();
        before(function () {
            req.tent = new accessor_1.Accessor(req, res);
            res.tent = new accessor_1.Dispatcher(req, res);
            req.tent.payload =
                {
                    name: "AB",
                    age: 18
                };
        });
        it('should return a middleware', function () {
            mw = validationPlugin.validationMiddleware();
            chai_1.expect(mw).to.be.a('function');
        });
        it('should pass valid payloads for POST', function (done) {
            req.method = 'POST';
            util_1.promisify(mw, req, res)
                .then(function () {
                done();
            })["catch"](done);
        });
        it('should fail in incomplete payloads for POST', function (done) {
            req.method = 'POST';
            req.tent.payload = { name: "ABC" }; //in POST is everyfield is required
            util_1.promisify(mw, req, res)
                .then(function () {
                try {
                    chai_1.expect(res._getStatusCode()).to.be.equal(400);
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
        it('should fail in invalid payloads for POST', function (done) {
            req.method = 'POST';
            req.tent.payload = { name: "AB", age: 2 };
            util_1.promisify(mw, req, res)
                .then(function () {
                try {
                    chai_1.expect(res._getStatusCode()).to.be.equal(400);
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
        it('should pass valid payloads for PUT', function (done) {
            req.method = 'PUT';
            req.tent.payload = { age: 20 }; //PUT every key is optional
            util_1.promisify(mw, req, res)
                .then(function () {
                done();
            })["catch"](done);
        });
        it('should fail invalid payloads for PUT', function (done) {
            req.method = 'PUT';
            req.tent.payload = { name: "When your legs don't work like they've used to before 🎵🎵🎵" }; //Rejects very long input.
            util_1.promisify(mw, req, res)
                .then(function () {
                try {
                    chai_1.expect(res._getStatusCode()).to.be.equal(400);
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
        it('should return a middleware that adds `validation` object on `req.tent`', function () {
            chai_1.expect(req.tent.plugins.validation).to.exist;
        });
    });
    describe("#onFail", function () {
        it('should replace `onFailMiddlewareFactory`', function () {
            var a = function () { return function () { }; };
            validationPlugin.onFail(a);
            chai_1.expect(validationPlugin.onFailMiddlewareFactory).to.be.equal(a);
        });
    });
    describe("#init", function () {
        var model;
        var modelPostSpy;
        var modelPutSpy;
        var middlewareSpy;
        before(function () {
            model = new model_1.Model("ListValidation");
            model.install(validationPlugin);
            model.Routes.create();
            model.Routes.update();
            modelPostSpy = sinon_1.spy(model.Routes.builder("/", "POST"), "post");
            modelPutSpy = sinon_1.spy(model.Routes.builder("/", "PUT"), "post");
            middlewareSpy = sinon_1.spy(validationPlugin, "validationMiddleware");
            model.register();
        });
        it('should add middlewares post `sanitize` inside on `POST` and `PUT` route. ', function () {
            chai_1.expect(modelPostSpy.args[0][0] == "sanitize").to.be.equal(true);
            chai_1.expect(modelPutSpy.args[0][0] == "sanitize").to.be.equal(true);
            chai_1.expect(modelPostSpy.args[0][1]).to.be.a("function");
            chai_1.expect(modelPutSpy.args[0][1]).to.be.a("function");
            chai_1.expect(middlewareSpy.callCount).to.be.equal(2);
        });
    });
});
