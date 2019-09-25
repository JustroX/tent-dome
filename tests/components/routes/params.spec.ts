import * as Params from "../../../components/routes/params";

import { assert, expect, use } from "chai";
import { todo } from "../../util";
import { parse } from "query-string";


describe("Params",function()
{
	let output : Params.QueryParams = {  sort: {}, pagination: { limit: 10, offset: 0 }, filters: {}, populate: [] };
	let raw : Params.RawQuery;

	function parseURI(uri : string)
	{
		raw = parse(uri,{
			parseNumbers: true,
			parseBooleans: true
		}) as Params.RawQuery;
	}

	describe("#Sort",function()
	{
		it('case 1: straightforward sort=name',function()
		{
			parseURI("sort=name");
			Params.Sort(output,raw);

			expect( output.sort["name"] ).to.be.equal(1);
		});
		it('case 2: negation, sort=-name',function()
		{
			parseURI("sort=-name");
			Params.Sort(output,raw);

			expect( output.sort["name"] ).to.be.equal(-1);
		});
		it('case 3: should return empty object when param is empty, sort=',function()
		{
			output.sort = {};
			parseURI("sort=");
			Params.Sort(output,raw);

			expect( output.sort ).to.be.deep.equal({});
		});
		it('case 4: should return empty object when sort is not defined',function()
		{
			output.sort = {};
			parseURI("notsort=sample");
			Params.Sort(output,raw);
		});
	});

	describe("#Pagination",function()
	{
		it('case 1: limit only, limit=12',function()
		{
			parseURI("limit=12");
			Params.Pagination(output,raw);
			expect( output.pagination.limit ).to.be.equal(12);
			expect( output.pagination.offset ).to.be.equal(0);
		})
		it('case 2: offset only, offset=12',function()
		{
			parseURI("offset=20");
			Params.Pagination(output,raw);
			expect( output.pagination.offset ).to.be.equal(20);
			expect( output.pagination.limit ).to.be.equal(12);
		})
		it('case 3: empty limit, should not edit, limit=',function()
		{
			parseURI("limit=");
			Params.Pagination(output,raw);
			expect( output.pagination.limit ).to.be.equal(12);
		})
		it('case 4: empty offset, should not edit, limit=',function()
		{
			parseURI("offset=");
			Params.Pagination(output,raw);
			expect( output.pagination.offset ).to.be.equal(20);
		})
		it('case 5: undefined both, should not edit, limit=',function()
		{
			parseURI("notoffset=1&notlimit=2");
			Params.Pagination(output,raw);
			expect( output.pagination.offset ).to.be.equal(20);
			expect( output.pagination.limit ).to.be.equal(12);
		})
	});

	describe("#Filters",function()
	{
		before(function()
		{
			//set read permissions
		});

		describe("#FilterSanitize",function()
		{
			it("case 1: straightforward, key=val",function()
			{
				parseURI("key=val")
				Params.FilterSanitize(output,raw);
				expect(output.filters["key"]).to.be.equal("val");
			});
			it("case 2: blacklisted, sort=name",function()
			{
				parseURI("sort=name")
				Params.FilterSanitize(output,raw);
				expect(output.filters["sort"]).to.not.exist;
			});
			it("case 3: blacklisted, sort=name",function()
			{
				const BLACKLIST = [ "sort"  , "limit", "offset" , "expand" ];
				for(let key of BLACKLIST)
				{
					parseURI(key+"=name")
					Params.FilterSanitize(output,raw);
					expect(output.filters[key]).to.not.exist;
				}
			});
		});
		describe("#ValueParse",function()
		{
			describe("case 1: string",function()
			{
				it("should work properly",function()
				{
					let a = Params.ValueParse("val");
					expect(typeof a).to.be.equal("string");
					expect(a).to.be.equal("val");
				})
			});
			describe("case 2: date",function()
			{
				it("should work properly",function()
				{
					let a : Date = Params.ValueParse("$dt_07.15.1999");
					expect(a).to.be.instanceof(Date);
					expect(a.toUTCString()).to.be.equal((new Date("07.15.1999")).toUTCString());
				});
			});
			describe("case 3: boolean",function()
			{
				it("work on true",function()
				{
					let a : boolean = Params.ValueParse("$bl_true");
					expect(typeof a).to.be.equal("boolean");
					expect(a).to.be.equal(true);
				});	
				it("work on false",function()
				{
					let a : boolean = Params.ValueParse("$bl_false");
					expect(typeof a).to.be.equal("boolean");
					expect(a).to.be.equal(false);
				});	
				it("return false if none of them",function()
				{
					let a : boolean = Params.ValueParse("$bl_randomstring");
					expect(typeof a).to.be.equal("boolean");
					expect(a).to.be.equal(false);
				});	
			});
			describe("case 4: string",function()
			{
				it("should work properly",function()
				{
					let a : string = Params.ValueParse("$st_sampleString");
					expect(typeof a).to.be.equal("string");
					expect(a).to.be.equal("sampleString");
				});
			});
			describe("case 5: integer",function()
			{
				it("should work straightforward",function()
				{
					let a : number = Params.ValueParse("$zz_12");
					expect(typeof a).to.be.equal("number");
					expect(a).to.be.equal(12);
				});

				it("should floor numbers",function()
				{
					let a : number = Params.ValueParse("$zz_12.92");
					expect(typeof a).to.be.equal("number");
					expect(a).to.be.equal(12);
				});
			});
			describe("case 6: float",function()
			{
				it("should work properly",function()
				{
					let a : number = Params.ValueParse("$fl_12.92");
					expect(typeof a).to.be.equal("number");
					expect(a).to.be.equal(12.92);					
				});
			});
			describe("case 7: not equal",function()
			{
				it("should work on straightforward input",function()
				{
					let a : any= Params.ValueParse("$ne_sample");
					expect(a).to.be.deep.equal({ $ne: "sample" });
				});
				it("should work on casted input",function()
				{
					let a : any= Params.ValueParse("$ne_$zz_12.92");
					expect(a).to.be.deep.equal({ $ne: 12 });
				});
			});
			describe("case 8: like",function()
			{
				it("should work on straightforward input",function()
				{
					let a : any= Params.ValueParse("$lk_sample");
					expect(a.$regex).to.be.an.instanceof(RegExp);
					expect(a.$options).to.be.equal('i');
				});
			});
			describe("case 8: null value",function()
			{
				it("should work on straightforward input",function()
				{
					let a : any= Params.ValueParse("$nll");
					expect(a).to.be.equal(null);
				});
			});
		});
		describe("#FilterParse",function()
		{
			describe("bounded input",function()
			{
				it('should work on double bound',function()
				{
					parseURI("key=1..2");
					Params.FilterSanitize(output,raw);
					Params.FilterParse(output);

					expect(output.filters.key).to.be.deep.equal({ $gte: '1', $lte: '2' });
				});

				it('should work on left bound',function()
				{
					parseURI("key=1..");
					Params.FilterSanitize(output,raw);
					Params.FilterParse(output);
					expect(output.filters.key).to.be.deep.equal({ $gte: '1' });
				});

				it('should work on right bound',function()
				{
					parseURI("key=..2");
					Params.FilterSanitize(output,raw);
					Params.FilterParse(output);
					expect(output.filters.key).to.be.deep.equal({ $lte: '2' });
				});

				it('should work on casted bounds',function()
				{
					parseURI("key=$dt_7.15.99..$zz_12.92");
					Params.FilterSanitize(output,raw);
					Params.FilterParse(output);
					expect(output.filters.key.$lte).to.be.equal(12);
					expect(output.filters.key.$gte).to.be.an.instanceof(Date);
					expect(output.filters.key.$gte.toUTCString()).to.be.equal((new Date("07.15.99")).toUTCString());
				});

			});
			describe("list input",function()
			{
				it('should work on straightforward list',function()
				{
					parseURI("key=1,2,3,4,3");
					Params.FilterSanitize(output,raw);
					Params.FilterParse(output);
					expect(output.filters.key.$in).to.be.deep.equal(['1','2','3','4','3']);
				});
				it('should work on casted list',function()
				{
					parseURI("key=$dt_7.15.1999,$zz_12.92,$fl_12.92,sample");
					Params.FilterSanitize(output,raw);
					Params.FilterParse(output);

					expect(output.filters.key.$in[0]).to.be.an.instanceof(Date);
					expect(output.filters.key.$in[0].toUTCString()).to.be.equal((new Date("07.15.99")).toUTCString());

					expect(output.filters.key.$in[1]).to.be.equal(12);
					expect(output.filters.key.$in[2]).to.be.equal(12.92);
					expect(output.filters.key.$in[3]).to.be.equal("sample");
					
				});
			});
			describe("single value input",function()
			{
				it('should work on straightforward input',function()
				{
					parseURI("key=value");
					Params.FilterSanitize(output,raw);
					Params.FilterParse(output);

					expect(output.filters.key).to.be.equal("value");
				});
				it('should work on auto-casted input',function()
				{
					parseURI("key=12");
					Params.FilterSanitize(output,raw);
					Params.FilterParse(output);

					expect(output.filters.key).to.be.equal(12);
				});
				it('should work on casted input',function()
				{
					parseURI("key=$zz_12.92");
					Params.FilterSanitize(output,raw);
					Params.FilterParse(output);

					expect(output.filters.key).to.be.equal(12);
				});
			});

			describe("multi filter",function()
			{
				it('should work on straightforward input',function()
				{
					output.filters = {};
					parseURI("key1=value1&key2=value2");
					Params.FilterSanitize(output,raw);
					Params.FilterParse(output);
					expect(output.filters.key1).to.be.equal("value1");
					expect(output.filters.key2).to.be.equal("value2");
				});		
			});
		});
		describe("#Filter main",function()
		{
			it('should work properly',function()
			{
				expect(function()
				{
					parseURI("key=value")
					Params.Filters( output, raw );
				}).to.not.throw();
			});
			it('should have empty object if there is no filter',function()
			{
				output.filters = {};
				parseURI("")
				Params.Filters( output, raw );
				expect(output.filters).to.be.deep.equal({});
			});
		});
	});

	describe("#Expand",function()
	{
		before(function()
		{
			//set expandable fields
		});

		it("should have empty object if there is no expand",function()
		{
			output.populate = [];
			parseURI("")
			Params.Expand( output, raw );
			expect(output.populate).to.be.deep.equal([]);
		});

		it("should work properly on basic input",function()
		{
			parseURI("expand=key1,key2");
			Params.Expand( output, raw );
			expect(output.populate).to.be.deep.equal(["key1","key2"]);
		});

	});

	describe("#Parse",function()
	{
		it('should work properly',function()
		{
			let a : Params.QueryParams = Params.Parse("key1=a&key2=12..15&sort=-name&limit=1&offset=12&expand=bubble");
			expect(a).to.be.deep.equal({ 
				sort: { name: -1 },
				pagination: { limit: 1, offset: 12 },
				filters: { key1 : "a" , key2 : { $gte: "12", $lte: "15" } },
				populate : ["bubble"]
			});
		});
	});
});