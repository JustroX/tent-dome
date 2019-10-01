"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var middlewares_1 = require("../../../components/routes/middlewares");
var accessor_1 = require("../../../components/routes/accessor");
var node_mocks_http_1 = require("node-mocks-http");
var model_1 = require("../../../components/model");
var chai_1 = require("chai");
var util_1 = require("../../util");
var chaiHTTP = require("chai-http");
var express = require("express");
var mongoose = require("mongoose");
chai_1.use(chaiHTTP);
//precondition
require("./accessor.spec");
describe("Middlewares", function () {
    var app;
    var req, res;
    before(function (done) {
        req = node_mocks_http_1.createRequest();
        res = node_mocks_http_1.createResponse();
        process.nextTick(function () {
            mongoose.connection.dropDatabase(done);
        });
    });
    beforeEach(function () {
        app = express();
    });
    describe("#initTent", function () {
        it('should assign accessor and dispatcher', function (done) {
            middlewares_1.Middlewares.initTent(req, res, function (err) {
                if (err)
                    return done(err);
                chai_1.expect(req.tent).to.be.an["instanceof"](accessor_1.Accessor);
                chai_1.expect(res.tent).to.be.an["instanceof"](accessor_1.Dispatcher);
                done();
            });
        });
    });
    describe("#model", function () {
        it('should assign a model', function (done) {
            middlewares_1.Middlewares.model("Person")(req, res, function (err) {
                if (err)
                    return done(err);
                chai_1.expect(req.tent.model).to.be.equal(model_1.get("Person"));
                chai_1.expect(req.tent.collection).to.be.equal(model_1.get("Person").Schema.model);
                done();
            });
        });
    });
    describe("#create", function () {
        before(function () {
            req.tent.model = undefined;
            req.tent.collection = undefined;
        });
        it('should throw if model is not yet called', function (done) {
            util_1.promisify(middlewares_1.Middlewares.create(), req, res).then(function () {
                done(new Error("Should throw"));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should not throw', function (done) {
            util_1.promisify(middlewares_1.Middlewares.model("Person"), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.create(), req, res)
                    .then(function () {
                    done();
                })["catch"](function (err) {
                    done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should work properly', function () {
            chai_1.expect(req.tent.document).to.be.an["instanceof"](model_1.get("Person").Schema.model);
        });
        it('should be new', function () {
            chai_1.expect(req.tent.document.isNew).to.be.equal(true);
        });
        it('should not be modified', function () {
            chai_1.expect(req.tent.document.modified).to.be.not.ok;
        });
    });
    describe("#read", function () {
        var _id = "";
        before(function () {
            return __awaiter(this, void 0, void 0, function () {
                var Person, person;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            req.tent.model = undefined;
                            req.tent.collection = undefined;
                            Person = model_1.get("Person").Schema.model;
                            person = new Person();
                            person.name = "Sample Person";
                            person.age = 18;
                            return [4 /*yield*/, person.save()];
                        case 1:
                            _a.sent();
                            _id = person._id.toString();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should throw AssertionError if model is not yet called', function (done) {
            util_1.promisify(middlewares_1.Middlewares.read(), req, res)
                .then(function () {
                done(new Error("Does not throw."));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should throw if document param id is nonexistent', function (done) {
            util_1.promisify(middlewares_1.Middlewares.model("Person"), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.read(), req, res)
                    .then(function () {
                    done(new Error("Does not throw."));
                })["catch"](function (err) {
                    if (err.name == "AssertionError")
                        done();
                    else
                        done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should return 404 `Document not found` if document id is nonexistent', function (done) {
            req.params.id = "nonexistent document";
            util_1.promisify(middlewares_1.Middlewares.model("Person"), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.read(), req, res)
                    .then(function () {
                    try {
                        chai_1.expect(res._getStatusCode()).to.be.equal(404);
                        chai_1.expect(res._getData().error).to.be.equal("Document not found");
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                })["catch"](function (err) {
                    done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should work properly', function (done) {
            req.params.id = _id;
            util_1.promisify(middlewares_1.Middlewares.model("Person"), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.read(), req, res)
                    .then(function () {
                    try {
                        chai_1.expect(req.tent.document).to.exist;
                        chai_1.expect(req.tent.document.name).to.be.equal("Sample Person");
                        chai_1.expect(req.tent.document.age).to.be.equal(18);
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                })["catch"](function (err) {
                    done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should not be new', function () {
            chai_1.expect(req.tent.document.isNew).to.be.not.ok;
        });
        it('should not be modified', function () {
            chai_1.expect(req.tent.document.modified).to.be.not.ok;
        });
    });
    describe("#sanitize", function () {
        beforeEach(function () {
            //reset payload
            req.tent.payload = {};
        });
        it("should be able to work on basic body", function (done) {
            req.body =
                {
                    name: "sample",
                    age: 12
                };
            util_1.promisify(middlewares_1.Middlewares.sanitize(), req, res)
                .then(function () {
                try {
                    chai_1.expect(req.tent.payload).to.be.eql({
                        name: "sample",
                        age: 12
                    });
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](function (err) {
                done(err);
            });
        });
        it("should be able to flatten body", function (done) {
            req.body =
                {
                    name: "sample",
                    age: 12,
                    layer: {
                        sublayer: 2
                    }
                };
            util_1.promisify(middlewares_1.Middlewares.sanitize(), req, res)
                .then(function () {
                try {
                    chai_1.expect(req.tent.payload).to.be.eql({
                        name: "sample",
                        age: 12,
                        "layer.sublayer": 2
                    });
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](function (err) {
                done(err);
            });
        });
    });
    describe("#assign", function () {
        before(function () {
            req.tent.payload = undefined;
            req.body = { name: "Sample", age: 18 };
        });
        it("should throw error if #Read or #FreshDocument is not yet called", function (done) {
            req.tent.document = undefined;
            util_1.promisify(middlewares_1.Middlewares.assign(), req, res)
                .then(function () {
                done(new Error("Should throw"));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it("should throw error if #sanitize is not yet called", function (done) {
            req.tent.document = undefined;
            req.tent.payload = undefined;
            util_1.promisify(middlewares_1.Middlewares.create(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.assign(), req, res)
                    .then(function () {
                    done(new Error("Should throw"));
                })["catch"](function (err) {
                    if (err.name == "AssertionError")
                        done();
                    else
                        done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
        it("should assign value properly", function (done) {
            util_1.promisify(middlewares_1.Middlewares.create(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.sanitize(), req, res)
                    .then(function () {
                    util_1.promisify(middlewares_1.Middlewares.assign(), req, res)
                        .then(function () {
                        try {
                            var keys = ["name", "age"];
                            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                                var i = keys_1[_i];
                                chai_1.expect(req.tent.document.get(i)).to.be.equal(req.tent.payload[i]);
                            }
                            done();
                        }
                        catch (err) {
                            done(err);
                        }
                    })["catch"](function (err) {
                        done(err);
                    });
                })["catch"](function (err) {
                    done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
    });
    describe("#method", function () {
        before(function () {
            req.tent.model = undefined;
            req.tent.collection = undefined;
            req.tent.document = undefined;
        });
        it('should throw if model is not yet called', function (done) {
            util_1.promisify(middlewares_1.Middlewares.method("sayHello"), req, res).then(function () {
                done(new Error("Should throw"));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should throw if #FreshDocument or #Read is not yet called is not yet called', function (done) {
            ;
            util_1.promisify(middlewares_1.Middlewares.model("Person"), req, res).then(function () {
                util_1.promisify(middlewares_1.Middlewares.method("sayHello"), req, res).then(function () {
                    done(new Error("Should throw"));
                })["catch"](function (err) {
                    if (err.name == "AssertionError")
                        done();
                    else
                        done(err);
                });
            })["catch"](done);
        });
        it('should throw if method is nonexistent', function (done) {
            util_1.promisify(middlewares_1.Middlewares.model("Person"), req, res).then(function () {
                util_1.promisify(middlewares_1.Middlewares.create(), req, res).then(function () {
                    util_1.promisify(middlewares_1.Middlewares.method("NonexistentMethod"), req, res).then(function () {
                        done(new Error("Should throw"));
                    })["catch"](function (err) {
                        if (err.name == "AssertionError")
                            done();
                        else
                            done(err);
                    })["catch"](done);
                })["catch"](done);
            });
        });
        it('should work properly', function (done) {
            util_1.promisify(middlewares_1.Middlewares.model("Person"), req, res).then(function () {
                util_1.promisify(middlewares_1.Middlewares.create(), req, res).then(function () {
                    util_1.promisify(middlewares_1.Middlewares.method("sayHello"), req, res).then(function () {
                        try {
                            chai_1.expect(req.tent.returnVal).to.be.deep.equal({ value: "Hello" });
                            done();
                        }
                        catch (e) {
                            done(e);
                        }
                    })["catch"](done);
                })["catch"](done);
            })["catch"](done);
        });
    });
    describe("#static", function () {
        before(function () {
            req.tent.model = undefined;
            req.tent.collection = undefined;
            req.tent.returnVal = undefined;
        });
        it('should throw if model is not yet called', function (done) {
            util_1.promisify(middlewares_1.Middlewares.static("sayHello"), req, res).then(function () {
                done(new Error("Should throw"));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should throw if static is nonexistent', function (done) {
            util_1.promisify(middlewares_1.Middlewares.model("Person"), req, res).then(function () {
                util_1.promisify(middlewares_1.Middlewares.static("NonexistentMethod"), req, res).then(function () {
                    done(new Error("Should throw"));
                })["catch"](function (err) {
                    if (err.name == "AssertionError")
                        done();
                    else
                        done(err);
                });
            })["catch"](done);
        });
        it('should work properly', function (done) {
            util_1.promisify(middlewares_1.Middlewares.model("Person"), req, res).then(function () {
                util_1.promisify(middlewares_1.Middlewares.static("sayHello"), req, res).then(function () {
                    try {
                        chai_1.expect(req.tent.returnVal).to.be.deep.equal({ value: "Hello Static" });
                        done();
                    }
                    catch (e) {
                        done(e);
                    }
                })["catch"](done);
            })["catch"](done);
        });
    });
    describe("#save", function () {
        it('should throw AssertionError when document is not yet defined', function (done) {
            req.tent.document = undefined;
            util_1.promisify(middlewares_1.Middlewares.save(), req, res)
                .then(function () {
                done(new Error("Should throw."));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should not throw when document is defined', function (done) {
            util_1.promisify(middlewares_1.Middlewares.create(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.save(), req, res).then(function () {
                    done();
                })["catch"](function (err) {
                    done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should save the document in the database.', function (done) {
            var _this = this;
            req.body = {
                name: "Sample test",
                age: 20
            };
            req.tent.document = undefined;
            util_1.promisify(middlewares_1.Middlewares.create(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.sanitize(), req, res).then(function () {
                    util_1.promisify(middlewares_1.Middlewares.assign(), req, res).then(function () {
                        util_1.promisify(middlewares_1.Middlewares.save(), req, res).then(function () { return __awaiter(_this, void 0, void 0, function () {
                            var doc, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, req.tent.collection.find({ name: "Sample test" }).exec()];
                                    case 1:
                                        doc = (_a.sent());
                                        chai_1.expect(doc.length).to.be.gte(1);
                                        doc = doc[0];
                                        chai_1.expect(doc.age).to.be.equal(20);
                                        done();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_1 = _a.sent();
                                        done(err_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })["catch"](function (err) {
                            done(err);
                        });
                    })["catch"](function (err) {
                        done(err);
                    });
                })["catch"](function (err) {
                    done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
    });
    describe("#remove", function () {
        var _id = "";
        var SAMPLE_NAME = "Sample Person to be Deleted";
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function () {
                var Person, person;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            req.tent.model = undefined;
                            req.tent.collection = undefined;
                            req.tent.document = undefined;
                            req.tent.Model("Person");
                            Person = model_1.get("Person").Schema.model;
                            person = new Person();
                            person.name = SAMPLE_NAME;
                            person.age = 99;
                            return [4 /*yield*/, person.save()];
                        case 1:
                            _a.sent();
                            _id = person._id.toString();
                            return [2 /*return*/];
                    }
                });
            });
        });
        afterEach(function () {
            return __awaiter(this, void 0, void 0, function () {
                var Person, person;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Person = model_1.get("Person").Schema.model;
                            return [4 /*yield*/, Person.find({ _id: _id }).exec()];
                        case 1:
                            person = (_a.sent())[0];
                            if (!person) return [3 /*break*/, 3];
                            return [4 /*yield*/, person.remove()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        it('should throw AssertionError when document is not yet defined', function (done) {
            util_1.promisify(middlewares_1.Middlewares.remove(), req, res)
                .then(function () {
                done(new Error("Should throw."));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should throw when document defined is new', function (done) {
            util_1.promisify(middlewares_1.Middlewares.create(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.remove(), req, res)
                    .then(function () {
                    done(new Error("Should throw"));
                })["catch"](function (err) {
                    if (err.name == "AssertionError")
                        done();
                    else
                        done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should not throw when old document is defined', function (done) {
            req.params.id = _id;
            util_1.promisify(middlewares_1.Middlewares.read(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.remove(), req, res)
                    .then(function () {
                    done();
                })["catch"](function (err) {
                    done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should delete data in the database', function (done) {
            var _this = this;
            req.params.id = _id;
            util_1.promisify(middlewares_1.Middlewares.read(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.remove(), req, res)
                    .then(function () { return __awaiter(_this, void 0, void 0, function () {
                    var Person, persons, e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                Person = model_1.get("Person").Schema.model;
                                return [4 /*yield*/, Person.find({ _id: _id }).exec()];
                            case 1:
                                persons = _a.sent();
                                chai_1.expect(persons.length).to.be.equal(0);
                                done();
                                return [3 /*break*/, 3];
                            case 2:
                                e_1 = _a.sent();
                                done(e_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })["catch"](function (err) {
                    done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
    });
    describe("#param", function () {
        it("should parse params properly", function (done) {
            req.query = {
                name: "a",
                age: "12..15",
                sort: "-name",
                limit: "1",
                offset: "12",
                expand: "bubble"
            };
            util_1.promisify(middlewares_1.Middlewares.param(), req, res)
                .then(function () {
                try {
                    chai_1.expect(req.tent.param).to.be.deep.equal({
                        sort: { name: -1 },
                        pagination: { limit: 1, offset: 12 },
                        filters: { name: "a", age: { $gte: "12", $lte: "15" } },
                        populate: ["bubble"]
                    });
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](function (err) {
                done(err);
            });
        });
    });
    describe("#list", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function () {
                var Bubble, bubbleDoc, docs;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            req.tent.param = undefined;
                            Bubble = model_1.get("Bubble").Schema.model;
                            bubbleDoc = new Bubble();
                            bubbleDoc.name = "HELLO";
                            return [4 /*yield*/, bubbleDoc.save()];
                        case 1:
                            _a.sent();
                            docs = [
                                {
                                    name: "Person 1",
                                    age: 2,
                                    date: new Date()
                                },
                                {
                                    name: "Person 2",
                                    age: 20,
                                    date: new Date()
                                },
                                {
                                    name: "Person 3",
                                    age: 100,
                                    date: new Date(),
                                    bubble: bubbleDoc._id
                                },
                            ];
                            return [4 /*yield*/, req.tent.collection.deleteMany({})];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, req.tent.collection.insertMany(docs)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, req.tent.collection.deleteMany({})];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should throw error if #Params is no yet called', function (done) {
            util_1.promisify(middlewares_1.Middlewares.list(), req, res)
                .then(function () {
                done(new Error("Should throw"));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should throw no error', function (done) {
            req.query = {};
            util_1.promisify(middlewares_1.Middlewares.param(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.list(), req, res)
                    .then(function () {
                    done();
                })["catch"](function (err) {
                    done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should work properly on basic query', function (done) {
            req.query = {};
            util_1.promisify(middlewares_1.Middlewares.param(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.list(), req, res)
                    .then(function () {
                    try {
                        chai_1.expect(req.tent.list).to.exist;
                        chai_1.expect(req.tent.list.length).to.be.equal(3);
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                })["catch"](function (err) {
                    done(err);
                });
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should work properly sort query', function (done) {
            var _this = this;
            req.query = { sort: "-age" };
            util_1.promisify(middlewares_1.Middlewares.param(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.list(), req, res)
                    .then(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            chai_1.expect(req.tent.list).to.exist;
                            chai_1.expect(req.tent.list.length).to.be.equal(3);
                            chai_1.expect(req.tent.list[0].age).to.be.equal(100);
                            chai_1.expect(req.tent.list[2].age).to.be.equal(2);
                            done();
                        }
                        catch (err) {
                            done(err);
                        }
                        return [2 /*return*/];
                    });
                }); })["catch"](function (err) { done(err); });
            })["catch"](function (err) { done(err); });
        });
        it('should work properly pagination query', function (done) {
            var _this = this;
            req.query = { limit: "1", offset: "1" };
            util_1.promisify(middlewares_1.Middlewares.param(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.list(), req, res)
                    .then(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            chai_1.expect(req.tent.list).to.exist;
                            chai_1.expect(req.tent.list.length).to.be.equal(1);
                            chai_1.expect(req.tent.list[0].age).to.be.equal(20);
                            done();
                        }
                        catch (err) {
                            done(err);
                        }
                        return [2 /*return*/];
                    });
                }); })["catch"](function (err) { done(err); });
            })["catch"](function (err) { done(err); });
        });
        it('should work properly on filter query', function (done) {
            var _this = this;
            req.query = { age: "20" };
            util_1.promisify(middlewares_1.Middlewares.param(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.list(), req, res)
                    .then(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            chai_1.expect(req.tent.list).to.exist;
                            chai_1.expect(req.tent.list.length).to.be.equal(1);
                            chai_1.expect(req.tent.list[0].age).to.be.equal(20);
                            done();
                        }
                        catch (err) {
                            done(err);
                        }
                        return [2 /*return*/];
                    });
                }); })["catch"](function (err) { done(err); });
            })["catch"](function (err) { done(err); });
        });
        it('should work properly on expand', function (done) {
            req.query = { expand: ["bubble"] };
            util_1.promisify(middlewares_1.Middlewares.param(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.list(), req, res)
                    .then(function () {
                    try {
                        chai_1.expect(req.tent.list).to.exist;
                        chai_1.expect(req.tent.list.length).to.be.equal(3);
                        chai_1.expect(req.tent.list[2].age).to.be.equal(100);
                        chai_1.expect(req.tent.list[2].bubble.name).to.be.equal("HELLO");
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                })["catch"](function (err) { done(err); });
            })["catch"](function (err) { done(err); });
        });
        it('should work properly on expand - remove expand', function (done) {
            req.query = { expand: [] };
            util_1.promisify(middlewares_1.Middlewares.param(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.list(), req, res)
                    .then(function () {
                    try {
                        chai_1.expect(req.tent.list).to.exist;
                        chai_1.expect(req.tent.list.length).to.be.equal(3);
                        chai_1.expect(req.tent.list[2].age).to.be.equal(100);
                        chai_1.expect(req.tent.list[2].bubble.name).to.not.exist;
                        done();
                    }
                    catch (err) {
                        done(err);
                    }
                })["catch"](function (err) { done(err); });
            })["catch"](function (err) { done(err); });
        });
    });
    describe("#success", function () {
        it('should respond 200', function (done) {
            util_1.promisify(middlewares_1.Middlewares.success(), req, res)
                .then(function () {
                try {
                    chai_1.expect(res._getStatusCode()).to.be.equal(200);
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
        it('should respond `success`', function (done) {
            util_1.promisify(middlewares_1.Middlewares.success(), req, res)
                .then(function () {
                try {
                    chai_1.expect(res._getData()).to.be.deep.equal({
                        message: "Success",
                        code: 200
                    });
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](done);
        });
    });
    describe("#show", function () {
        var _id = "";
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function () {
                var Person, person;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            req.tent.model = undefined;
                            req.tent.collection = undefined;
                            req.tent.document = undefined;
                            Person = model_1.get("Person").Schema.model;
                            person = new Person();
                            person.name = "Sample Person";
                            person.age = 18;
                            return [4 /*yield*/, person.save()];
                        case 1:
                            _a.sent();
                            _id = person._id.toString();
                            req.tent.Model("Person");
                            req.tent.Param({});
                            return [2 /*return*/];
                    }
                });
            });
        });
        afterEach(function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, req.tent.collection.deleteMany({})];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should throw when #Read is not yet called.', function (done) {
            util_1.promisify(middlewares_1.Middlewares.show(), req, res)
                .then(function () {
                done(new Error("Should throw."));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should throw when document is fresh.', function (done) {
            util_1.promisify(middlewares_1.Middlewares.create(), req, res).then(function () {
                util_1.promisify(middlewares_1.Middlewares.show(), req, res).then(function () {
                    done(new Error("Should throw."));
                })["catch"](function (err) {
                    if (err.name == "AssertionError")
                        done();
                    else
                        done(err);
                });
            })["catch"](function (err) { done(err); });
        });
        it('should not throw when #Read is defined.', function (done) {
            req.params.id = _id;
            util_1.promisify(middlewares_1.Middlewares.read(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.show(), req, res).then(function () { done(); })["catch"](function (err) { done(err); });
            })["catch"](function (err) { done(err); });
        });
        it('should properly return the document with status code of 200.', function (done) {
            req.params.id = _id;
            util_1.promisify(middlewares_1.Middlewares.read(), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares.show(), req, res).then(function () {
                    chai_1.expect(res._getStatusCode()).to.be.equal(200);
                    chai_1.expect(res._getData().toObject()).to.be.deep.equal(req.tent.document.toObject());
                    done();
                })["catch"](function (err) { done(err); });
            })["catch"](function (err) { done(err); });
        });
    });
    describe("#present", function () {
        before(function (done) {
            //create test documents
            var docs = [
                {
                    name: "Person 1",
                    age: 2,
                    date: new Date()
                },
                {
                    name: "Person 2",
                    age: 20,
                    date: new Date()
                },
                {
                    name: "Person 3",
                    age: 100,
                    date: new Date()
                },
            ];
            req.tent.list = undefined;
            req.tent.Model("Person");
            req.tent.Param({});
            req.tent.collection.insertMany(docs, done);
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, req.tent.collection.deleteMany({})];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should throw when list is not yet called', function (done) {
            util_1.promisify(middlewares_1.Middlewares.present(), req, res).then(function () { done(new Error("Should throw")); })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should not throw when list is called', function (done) {
            req.tent.Model("Person");
            req.tent.Param({});
            util_1.promisify(middlewares_1.Middlewares.list(), req, res).then(function () {
                util_1.promisify(middlewares_1.Middlewares.present(), req, res).then(function () {
                    done();
                })["catch"](done);
            })["catch"](done);
        });
        it('should return the list', function (done) {
            var _this = this;
            req.tent.Model("Person");
            req.tent.Param({});
            util_1.promisify(middlewares_1.Middlewares.list(), req, res).then(function () {
                util_1.promisify(middlewares_1.Middlewares.present(), req, res).then(function () { return __awaiter(_this, void 0, void 0, function () {
                    var list, trueList, err_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                list = res._getData();
                                return [4 /*yield*/, req.tent.collection.find({}).exec()];
                            case 1:
                                trueList = _a.sent();
                                chai_1.expect(list).to.exist;
                                chai_1.expect(list.length).to.be.equal(trueList.length);
                                chai_1.expect(list.map(function (x) { return x.toObject(); })).to.be.deep.equal(trueList.map(function (x) { return x.toObject(); }));
                                done();
                                return [3 /*break*/, 3];
                            case 2:
                                err_2 = _a.sent();
                                done(err_2);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })["catch"](done);
            })["catch"](done);
        });
    });
    describe("#return", function () {
        var _id = "";
        before(function () {
            return __awaiter(this, void 0, void 0, function () {
                var Person, person;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            req.tent.model = undefined;
                            req.tent.collection = undefined;
                            req.tent.returnVal = undefined;
                            Person = model_1.get("Person").Schema.model;
                            person = new Person();
                            person.name = "Sample Person";
                            person.age = 18;
                            return [4 /*yield*/, person.save()];
                        case 1:
                            _a.sent();
                            _id = person._id.toString();
                            return [4 /*yield*/, util_1.promisify(middlewares_1.Middlewares.model("Person"), req, res)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should throw when `static` or `method` is not yet called', function (done) {
            util_1.promisify(middlewares_1.Middlewares["return"](), req, res)
                .then(function () {
                done(new Error("Should throw."));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should properly return the `returnVal` with status code of 200.', function (done) {
            req.params.id = _id;
            util_1.promisify(middlewares_1.Middlewares.method("sayHello"), req, res)
                .then(function () {
                util_1.promisify(middlewares_1.Middlewares["return"](), req, res).then(function () {
                    chai_1.expect(res._getStatusCode()).to.be.equal(200);
                    chai_1.expect(res._getData()).to.be.deep.equal({ value: "Hello" });
                    done();
                })["catch"](function (err) { done(err); });
            })["catch"](function (err) { done(err); });
        });
    });
});
