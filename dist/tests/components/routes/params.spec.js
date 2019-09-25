"use strict";
exports.__esModule = true;
var Params = require("../../../components/routes/params");
var chai_1 = require("chai");
var query_string_1 = require("query-string");
describe("Params", function () {
    var output = { sort: {}, pagination: { limit: 10, offset: 0 }, filters: {}, populate: [] };
    var raw;
    function parseURI(uri) {
        raw = query_string_1.parse(uri, {
            parseNumbers: true,
            parseBooleans: true
        });
    }
    describe("#Sort", function () {
        it('case 1: straightforward sort=name', function () {
            parseURI("sort=name");
            Params.Sort(output, raw);
            chai_1.expect(output.sort["name"]).to.be.equal(1);
        });
        it('case 2: negation, sort=-name', function () {
            parseURI("sort=-name");
            Params.Sort(output, raw);
            chai_1.expect(output.sort["name"]).to.be.equal(-1);
        });
        it('case 3: should return empty object when param is empty, sort=', function () {
            output.sort = {};
            parseURI("sort=");
            Params.Sort(output, raw);
            chai_1.expect(output.sort).to.be.deep.equal({});
        });
        it('case 4: should return empty object when sort is not defined', function () {
            output.sort = {};
            parseURI("notsort=sample");
            Params.Sort(output, raw);
        });
    });
    describe("#Pagination", function () {
        it('case 1: limit only, limit=12', function () {
            parseURI("limit=12");
            Params.Pagination(output, raw);
            chai_1.expect(output.pagination.limit).to.be.equal(12);
            chai_1.expect(output.pagination.offset).to.be.equal(0);
        });
        it('case 2: offset only, offset=12', function () {
            parseURI("offset=20");
            Params.Pagination(output, raw);
            chai_1.expect(output.pagination.offset).to.be.equal(20);
            chai_1.expect(output.pagination.limit).to.be.equal(12);
        });
        it('case 3: empty limit, should not edit, limit=', function () {
            parseURI("limit=");
            Params.Pagination(output, raw);
            chai_1.expect(output.pagination.limit).to.be.equal(12);
        });
        it('case 4: empty offset, should not edit, limit=', function () {
            parseURI("offset=");
            Params.Pagination(output, raw);
            chai_1.expect(output.pagination.offset).to.be.equal(20);
        });
        it('case 5: undefined both, should not edit, limit=', function () {
            parseURI("notoffset=1&notlimit=2");
            Params.Pagination(output, raw);
            chai_1.expect(output.pagination.offset).to.be.equal(20);
            chai_1.expect(output.pagination.limit).to.be.equal(12);
        });
    });
    describe("#Filters", function () {
        before(function () {
            //set read permissions
        });
        describe("#FilterSanitize", function () {
            it("case 1: straightforward, key=val", function () {
                parseURI("key=val");
                Params.FilterSanitize(output, raw);
                chai_1.expect(output.filters["key"]).to.be.equal("val");
            });
            it("case 2: blacklisted, sort=name", function () {
                parseURI("sort=name");
                Params.FilterSanitize(output, raw);
                chai_1.expect(output.filters["sort"]).to.not.exist;
            });
            it("case 3: blacklisted, sort=name", function () {
                var BLACKLIST = ["sort", "limit", "offset", "expand"];
                for (var _i = 0, BLACKLIST_1 = BLACKLIST; _i < BLACKLIST_1.length; _i++) {
                    var key = BLACKLIST_1[_i];
                    parseURI(key + "=name");
                    Params.FilterSanitize(output, raw);
                    chai_1.expect(output.filters[key]).to.not.exist;
                }
            });
        });
        describe("#ValueParse", function () {
            describe("case 1: string", function () {
                it("should work properly", function () {
                    var a = Params.ValueParse("val");
                    chai_1.expect(typeof a).to.be.equal("string");
                    chai_1.expect(a).to.be.equal("val");
                });
            });
            describe("case 2: date", function () {
                it("should work properly", function () {
                    var a = Params.ValueParse("$dt_07.15.1999");
                    chai_1.expect(a).to.be["instanceof"](Date);
                    chai_1.expect(a.toUTCString()).to.be.equal((new Date("07.15.1999")).toUTCString());
                });
            });
            describe("case 3: boolean", function () {
                it("work on true", function () {
                    var a = Params.ValueParse("$bl_true");
                    chai_1.expect(typeof a).to.be.equal("boolean");
                    chai_1.expect(a).to.be.equal(true);
                });
                it("work on false", function () {
                    var a = Params.ValueParse("$bl_false");
                    chai_1.expect(typeof a).to.be.equal("boolean");
                    chai_1.expect(a).to.be.equal(false);
                });
                it("return false if none of them", function () {
                    var a = Params.ValueParse("$bl_randomstring");
                    chai_1.expect(typeof a).to.be.equal("boolean");
                    chai_1.expect(a).to.be.equal(false);
                });
            });
            describe("case 4: string", function () {
                it("should work properly", function () {
                    var a = Params.ValueParse("$st_sampleString");
                    chai_1.expect(typeof a).to.be.equal("string");
                    chai_1.expect(a).to.be.equal("sampleString");
                });
            });
            describe("case 5: integer", function () {
                it("should work straightforward", function () {
                    var a = Params.ValueParse("$zz_12");
                    chai_1.expect(typeof a).to.be.equal("number");
                    chai_1.expect(a).to.be.equal(12);
                });
                it("should floor numbers", function () {
                    var a = Params.ValueParse("$zz_12.92");
                    chai_1.expect(typeof a).to.be.equal("number");
                    chai_1.expect(a).to.be.equal(12);
                });
            });
            describe("case 6: float", function () {
                it("should work properly", function () {
                    var a = Params.ValueParse("$fl_12.92");
                    chai_1.expect(typeof a).to.be.equal("number");
                    chai_1.expect(a).to.be.equal(12.92);
                });
            });
            describe("case 7: not equal", function () {
                it("should work on straightforward input", function () {
                    var a = Params.ValueParse("$ne_sample");
                    chai_1.expect(a).to.be.deep.equal({ $ne: "sample" });
                });
                it("should work on casted input", function () {
                    var a = Params.ValueParse("$ne_$zz_12.92");
                    chai_1.expect(a).to.be.deep.equal({ $ne: 12 });
                });
            });
            describe("case 8: like", function () {
                it("should work on straightforward input", function () {
                    var a = Params.ValueParse("$lk_sample");
                    chai_1.expect(a.$regex).to.be.an["instanceof"](RegExp);
                    chai_1.expect(a.$options).to.be.equal('i');
                });
            });
            describe("case 8: null value", function () {
                it("should work on straightforward input", function () {
                    var a = Params.ValueParse("$nll");
                    chai_1.expect(a).to.be.equal(null);
                });
            });
        });
        describe("#FilterParse", function () {
            describe("bounded input", function () {
                it('should work on double bound', function () {
                    parseURI("key=1..2");
                    Params.FilterSanitize(output, raw);
                    Params.FilterParse(output);
                    chai_1.expect(output.filters.key).to.be.deep.equal({ $gte: '1', $lte: '2' });
                });
                it('should work on left bound', function () {
                    parseURI("key=1..");
                    Params.FilterSanitize(output, raw);
                    Params.FilterParse(output);
                    chai_1.expect(output.filters.key).to.be.deep.equal({ $gte: '1' });
                });
                it('should work on right bound', function () {
                    parseURI("key=..2");
                    Params.FilterSanitize(output, raw);
                    Params.FilterParse(output);
                    chai_1.expect(output.filters.key).to.be.deep.equal({ $lte: '2' });
                });
                it('should work on casted bounds', function () {
                    parseURI("key=$dt_7.15.99..$zz_12.92");
                    Params.FilterSanitize(output, raw);
                    Params.FilterParse(output);
                    chai_1.expect(output.filters.key.$lte).to.be.equal(12);
                    chai_1.expect(output.filters.key.$gte).to.be.an["instanceof"](Date);
                    chai_1.expect(output.filters.key.$gte.toUTCString()).to.be.equal((new Date("07.15.99")).toUTCString());
                });
            });
            describe("list input", function () {
                it('should work on straightforward list', function () {
                    parseURI("key=1,2,3,4,3");
                    Params.FilterSanitize(output, raw);
                    Params.FilterParse(output);
                    chai_1.expect(output.filters.key.$in).to.be.deep.equal(['1', '2', '3', '4', '3']);
                });
                it('should work on casted list', function () {
                    parseURI("key=$dt_7.15.1999,$zz_12.92,$fl_12.92,sample");
                    Params.FilterSanitize(output, raw);
                    Params.FilterParse(output);
                    chai_1.expect(output.filters.key.$in[0]).to.be.an["instanceof"](Date);
                    chai_1.expect(output.filters.key.$in[0].toUTCString()).to.be.equal((new Date("07.15.99")).toUTCString());
                    chai_1.expect(output.filters.key.$in[1]).to.be.equal(12);
                    chai_1.expect(output.filters.key.$in[2]).to.be.equal(12.92);
                    chai_1.expect(output.filters.key.$in[3]).to.be.equal("sample");
                });
            });
            describe("single value input", function () {
                it('should work on straightforward input', function () {
                    parseURI("key=value");
                    Params.FilterSanitize(output, raw);
                    Params.FilterParse(output);
                    chai_1.expect(output.filters.key).to.be.equal("value");
                });
                it('should work on auto-casted input', function () {
                    parseURI("key=12");
                    Params.FilterSanitize(output, raw);
                    Params.FilterParse(output);
                    chai_1.expect(output.filters.key).to.be.equal(12);
                });
                it('should work on casted input', function () {
                    parseURI("key=$zz_12.92");
                    Params.FilterSanitize(output, raw);
                    Params.FilterParse(output);
                    chai_1.expect(output.filters.key).to.be.equal(12);
                });
            });
            describe("multi filter", function () {
                it('should work on straightforward input', function () {
                    output.filters = {};
                    parseURI("key1=value1&key2=value2");
                    Params.FilterSanitize(output, raw);
                    Params.FilterParse(output);
                    chai_1.expect(output.filters.key1).to.be.equal("value1");
                    chai_1.expect(output.filters.key2).to.be.equal("value2");
                });
            });
        });
        describe("#Filter main", function () {
            it('should work properly', function () {
                chai_1.expect(function () {
                    parseURI("key=value");
                    Params.Filters(output, raw);
                }).to.not["throw"]();
            });
            it('should have empty object if there is no filter', function () {
                output.filters = {};
                parseURI("");
                Params.Filters(output, raw);
                chai_1.expect(output.filters).to.be.deep.equal({});
            });
        });
    });
    describe("#Expand", function () {
        before(function () {
            //set expandable fields
        });
        it("should have empty object if there is no expand", function () {
            output.populate = [];
            parseURI("");
            Params.Expand(output, raw);
            chai_1.expect(output.populate).to.be.deep.equal([]);
        });
        it("should work properly on basic input", function () {
            parseURI("expand=key1,key2");
            Params.Expand(output, raw);
            chai_1.expect(output.populate).to.be.deep.equal(["key1", "key2"]);
        });
    });
    describe("#Parse", function () {
        it('should work properly', function () {
            var a = Params.Parse("key1=a&key2=12..15&sort=-name&limit=1&offset=12&expand=bubble");
            chai_1.expect(a).to.be.deep.equal({
                sort: { name: -1 },
                pagination: { limit: 1, offset: 12 },
                filters: { key1: "a", key2: { $gte: "12", $lte: "15" } },
                populate: ["bubble"]
            });
        });
    });
});
