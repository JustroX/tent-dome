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
var accessor_1 = require("../../../components/routes/accessor");
var model_1 = require("../../../components/model");
var chai_1 = require("chai");
var util_1 = require("../../util");
var node_mocks_http_1 = require("node-mocks-http");
var chaiAsPromised = require("chai-as-promised");
var mongoose = require("mongoose");
chai_1.use(chaiAsPromised);
//precondition
require("./params.spec");
describe("Accessor", function () {
    var req = node_mocks_http_1.createRequest();
    var res = node_mocks_http_1.createResponse();
    var accessor;
    var dispatcher;
    before(function (done) {
        var model = {};
        model = new model_1.Model("Person");
        model.define({
            name: String,
            age: Number,
            date: { type: Date, "default": Date.now },
            layer: {
                sublayer: Number
            }
        });
        model.register();
        process.nextTick(function () {
            mongoose.connection.dropDatabase(done);
        });
    });
    describe("#constructor", function () {
        it('should not throw error', function () {
            chai_1.expect(function () {
                accessor = new accessor_1.Accessor(req, res);
            }).to.not["throw"]();
        });
    });
    describe("#Model", function () {
        it('should not throw any error', function () {
            chai_1.expect(function () {
                accessor.Model("Person");
            }).to.not["throw"]();
        });
        it('should attach the indicated model', function () {
            chai_1.expect(accessor.model).to.be.equal(model_1.get("Person"));
        });
        it('should attach the indicated collection', function () {
            chai_1.expect(accessor.collection).to.be.equal(model_1.get("Person").Schema.model);
        });
    });
    describe("#Sanitize", function () {
        before(function () {
            accessor.collection = undefined;
        });
        beforeEach(function () {
            //reset payload
            accessor.payload = {};
        });
        it("should throw when model is not yet called", function () {
            chai_1.expect(function () {
                accessor.Sanitize({});
            })
                .to["throw"]().property("name", "AssertionError");
        });
        it("should be able to work on basic body", function () {
            accessor.Model("Person");
            accessor.Sanitize({
                name: "sample",
                age: 12
            });
            chai_1.expect(accessor.payload).to.be.eql({
                name: "sample",
                age: 12
            });
        });
        it("should be able to flatten body", function () {
            accessor.Sanitize({
                name: "sample",
                age: 12,
                layer: {
                    sublayer: 2
                }
            });
            chai_1.expect(accessor.payload).to.be.eql({
                name: "sample",
                age: 12,
                "layer.sublayer": 2
            });
        });
        it("should be able to block undefined fields", function () {
            accessor.Sanitize({ not_field: 23, age: 12, name: "sample" });
            chai_1.expect(accessor.payload).to.be.eql({
                age: 12,
                name: "sample"
            });
        });
    });
    describe("#Validate", function () {
        util_1.todo();
    });
    describe("#FreshDocument", function () {
        before(function () {
            accessor.model = undefined;
            accessor.collection = undefined;
        });
        it('should throw if model is not yet called', function () {
            chai_1.expect(function () {
                accessor.FreshDocument();
            }).to["throw"]().property("name", "AssertionError");
        });
        it('should not throw', function () {
            accessor.document = undefined;
            accessor.Model("Person");
            chai_1.expect(function () {
                accessor.FreshDocument();
            }).to.not["throw"]();
        });
        it('should work properly', function () {
            chai_1.expect(accessor.document).to.be.an["instanceof"](model_1.get("Person").Schema.model);
        });
        it('should be new', function () {
            chai_1.expect(accessor.document.isNew).to.be.equal(true);
        });
        it('should not be modified', function () {
            chai_1.expect(accessor.document.isModified()).to.be.not.ok;
        });
    });
    describe("#Read", function () {
        var _id = "";
        before(function () {
            return __awaiter(this, void 0, void 0, function () {
                var Person, person;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            accessor.model = undefined;
                            accessor.collection = undefined;
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
            accessor.Read(_id)
                .then(function () {
                done(new Error("Does not throw."));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should throw if model is nonexistent', function (done) {
            accessor.Model("Person");
            accessor.Read("nonexistent id")
                .then(function () {
                done(new Error("Does not throw."));
            })["catch"](function (err) {
                if (err.name == "AssertionError" || err.name == "CastError")
                    done();
                else
                    done(err);
            });
        });
        it('should not throw', function (done) {
            accessor.document = undefined;
            accessor.Model("Person");
            accessor.Read(_id)
                .then(function () {
                done();
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should work properly', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, accessor.Read(_id)];
                        case 1:
                            _a.sent();
                            chai_1.expect(accessor.document).to.be.an["instanceof"](model_1.get("Person").Schema.model);
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should not be new', function () {
            chai_1.expect(accessor.document.isNew).to.be.not.ok;
        });
        it('should not be modified', function () {
            chai_1.expect(accessor.document.isModified()).to.be.not.ok;
        });
    });
    describe("#Assign", function () {
        before(function () {
            accessor.payload = undefined;
            accessor.document = undefined;
        });
        it("should throw error if #Sanitize is not yet called", function () {
            chai_1.expect(function () {
                accessor.Assign();
            }).to["throw"]("Assign can not be called without first calling Sanitize");
        });
        it("should throw error if #Read or #FreshDocument is not yet called", function () {
            accessor.Sanitize({ name: "Sample", age: 18 });
            chai_1.expect(function () {
                accessor.Assign();
            }).to["throw"]("Assign can not be called without first calling Read or FreshDocument");
        });
        it("should not throw error", function () {
            accessor.FreshDocument();
            chai_1.expect(function () {
                accessor.Assign();
            }).to.not["throw"]();
        });
        it("should assign value properly", function () {
            var keys = ["name", "age"];
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var i = keys_1[_i];
                chai_1.expect(accessor.document.get(i)).to.be.equal(accessor.payload[i]);
            }
        });
    });
    describe("#Param", function () {
        it("should parse params properly", function () {
            accessor.Param({
                key1: "a",
                key2: "12..15",
                sort: "-name",
                limit: "1",
                offset: "12",
                expand: "bubble"
            });
            // accessor.Param("key1=a&key2=12..15&sort=-name&limit=1&offset=12&expand=bubble");
            chai_1.expect(accessor.param).to.be.deep.equal({
                sort: { name: -1 },
                pagination: { limit: 1, offset: 12 },
                filters: { key1: "a", key2: { $gte: "12", $lte: "15" } },
                populate: ["bubble"]
            });
        });
    });
    describe("#List", function () {
        before(function (done) {
            var _this = this;
            accessor.param = undefined;
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
            (function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, accessor.collection.deleteMany({})];
                        case 1:
                            _a.sent();
                            accessor.collection.insertMany(docs, done);
                            return [2 /*return*/];
                    }
                });
            }); })();
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, accessor.collection.deleteMany({})];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should throw error if #Params is no yet called', function () {
            chai_1.expect(accessor.List()).to.be.rejectedWith();
        });
        it('should throw no error', function () {
            accessor.Param({});
            chai_1.expect(accessor.List()).to.be.eventually.not.ok;
        });
        it('should work properly on basic query', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            accessor.Param({});
                            return [4 /*yield*/, accessor.List()];
                        case 1:
                            _a.sent();
                            chai_1.expect(accessor.list).to.exist;
                            chai_1.expect(accessor.list.length).to.be.equal(3);
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should work properly sort query', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            accessor.Param({ sort: "-age" });
                            return [4 /*yield*/, accessor.List()];
                        case 1:
                            _a.sent();
                            chai_1.expect(accessor.list).to.exist;
                            chai_1.expect(accessor.list.length).to.be.equal(3);
                            chai_1.expect(accessor.list[0].age).to.be.equal(100);
                            chai_1.expect(accessor.list[2].age).to.be.equal(2);
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should work properly pagination query', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            accessor.Param({ limit: "1", offset: "1" });
                            return [4 /*yield*/, accessor.List()];
                        case 1:
                            _a.sent();
                            chai_1.expect(accessor.list).to.exist;
                            chai_1.expect(accessor.list.length).to.be.equal(1);
                            chai_1.expect(accessor.list[0].age).to.be.equal(20);
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should work properly on filter query', function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            accessor.Param({ age: "20" });
                            return [4 /*yield*/, accessor.List()];
                        case 1:
                            _a.sent();
                            chai_1.expect(accessor.list).to.exist;
                            chai_1.expect(accessor.list.length).to.be.equal(1);
                            chai_1.expect(accessor.list[0].age).to.be.equal(20);
                            return [2 /*return*/];
                    }
                });
            });
        });
        describe('should work properly on expand', function () {
            util_1.todo();
        });
    });
    describe("#Save", function () {
        before(function () {
            accessor.document = undefined;
        });
        it('should throw AssertionError when document is not yet defined', function (done) {
            accessor.Save()
                .then(function () {
                done(new Error("Should throw"));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should not throw when document is defined', function (done) {
            accessor.FreshDocument();
            accessor.Save().then(function () {
                done();
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should save the document in the database.', function () {
            return __awaiter(this, void 0, void 0, function () {
                var docs, doc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            accessor.FreshDocument();
                            accessor.document.name = "Sample test";
                            accessor.document.age = 20;
                            return [4 /*yield*/, accessor.Save()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, accessor.collection.find({ name: "Sample test" }).exec()];
                        case 2:
                            docs = (_a.sent());
                            chai_1.expect(docs.length).to.be.gte(1);
                            doc = docs[0];
                            chai_1.expect(doc.age).to.be.equal(20);
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe("#Delete", function () {
        var _id = "";
        var SAMPLE_NAME = "Sample Person to be Deleted";
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function () {
                var Person, person;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            accessor.model = undefined;
                            accessor.collection = undefined;
                            accessor.document = undefined;
                            accessor.Model("Person");
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
            accessor.Delete()
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
            accessor.FreshDocument();
            accessor.Delete().then(function () {
                done(new Error("Should throw"));
            })["catch"](function (err) {
                if (err.name == "AssertionError")
                    done();
                else
                    done(err);
            });
        });
        it('should not throw when old document is defined', function (done) {
            accessor.Read(_id)
                .then(function () {
                accessor.Delete()
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
            accessor.Read(_id)
                .then(function () {
                accessor.Delete()
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
    describe("#Present", function () {
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
            accessor.list = undefined;
            accessor.Model("Person");
            accessor.Param({});
            accessor.collection.insertMany(docs, done);
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, accessor.collection.deleteMany({})];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should throw when list is not yet called', function () {
            chai_1.expect(function () {
                accessor.Present();
            }).to["throw"]().property("name", "AssertionError");
        });
        it('should not throw when list is called', function (done) {
            accessor.Model("Person");
            accessor.Param({});
            accessor.List().then(function () {
                try {
                    accessor.Present();
                    done();
                }
                catch (err) {
                    done(err);
                }
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should return the list', function (done) {
            var _this = this;
            accessor.List().then(function () { return __awaiter(_this, void 0, void 0, function () {
                var list, trueList, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            list = accessor.Present();
                            return [4 /*yield*/, accessor.collection.find({}).exec()];
                        case 1:
                            trueList = _a.sent();
                            chai_1.expect(list).to.exist;
                            chai_1.expect(list.length).to.be.equal(trueList.length);
                            chai_1.expect(list.map(function (x) { return x.toObject(); })).to.be.deep.equal(trueList.map(function (x) { return x.toObject(); }));
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
        });
        it('should sanitize list');
    });
    describe("#Show", function () {
        var _id = "";
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function () {
                var Person, person;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            accessor.model = undefined;
                            accessor.collection = undefined;
                            accessor.document = undefined;
                            Person = model_1.get("Person").Schema.model;
                            person = new Person();
                            person.name = "Sample Person";
                            person.age = 18;
                            return [4 /*yield*/, person.save()];
                        case 1:
                            _a.sent();
                            _id = person._id.toString();
                            accessor.Model("Person");
                            accessor.Param({});
                            return [2 /*return*/];
                    }
                });
            });
        });
        afterEach(function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, accessor.collection.deleteMany({})];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should throw when #Read is not yet called.', function () {
            chai_1.expect(function () {
                accessor.Show();
            }).to["throw"]().property("name", "AssertionError");
        });
        it('should throw when document is fresh.', function () {
            accessor.FreshDocument();
            chai_1.expect(function () {
                accessor.Show();
            }).to["throw"]().property("name", "AssertionError");
        });
        it('should not throw when #Read is defined.', function (done) {
            accessor.Read(_id)
                .then(function () {
                chai_1.expect(function () {
                    accessor.Show();
                }).to.not["throw"]();
                done();
            })["catch"](function (err) {
                done(err);
            });
        });
        it('should properly return the document.', function (done) {
            accessor.Read(_id)
                .then(function () {
                var a = accessor.Show();
                chai_1.expect(a).to.be.equal(accessor.document);
                done();
            })["catch"](function (err) {
                done(err);
            });
        });
    });
});
describe("Dispatcher", function () {
    var req = node_mocks_http_1.createRequest();
    var res = node_mocks_http_1.createResponse();
    var dispatcher;
    describe("#constructor", function () {
        beforeEach(function () {
            if (dispatcher) {
                dispatcher.req = undefined;
                dispatcher.res = undefined;
            }
        });
        it('should not throw', function () {
            chai_1.expect(function () {
                dispatcher = new accessor_1.Dispatcher(req, res);
            }).to.not["throw"]();
        });
        it('should assign req and res.', function () {
            chai_1.expect(function () {
                dispatcher = new accessor_1.Dispatcher(req, res);
                chai_1.expect(dispatcher.req).to.be.equal(req);
                chai_1.expect(dispatcher.res).to.be.equal(res);
            });
        });
    });
    describe("#apiError", function () {
        before(function () {
            dispatcher = new accessor_1.Dispatcher(req, res);
        });
        it('should send status code and message', function () {
            dispatcher.apiError(404, "Sample error");
            chai_1.expect(res._getStatusCode()).to.be.equal(404);
            chai_1.expect(res._getData().error).to.be.equal("Sample error");
        });
        it('should send 500 with error', function () {
            dispatcher.apiError(new Error("Sample error"));
            chai_1.expect(res._getStatusCode()).to.be.equal(500);
            chai_1.expect(res._getData().error).to.be.equal("Sample error");
        });
    });
});
