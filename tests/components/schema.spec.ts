import { Schema } from "../../components/schema";
import { assert, expect } from "chai";
import { todo } from "../util";

describe("Schema",function()
{
	var schema : Schema;
	describe("#constructor",function()
	{
		schema = new Schema("sample");
		it('should assign a name',function()
		{
			expect(schema["name"]).to.be.equal('sample');
		});
	});


	describe("#virtual",function()
	{
		beforeEach(function()
		{
			delete schema["virtuals"].sample;
		});

		it("should be saved in the virtuals",function()
		{
			let virtualDefinition : any = {
				get: function() : string
				{
					return this.sample as string;
				},
				set: function( val : string )
				{
					this.sample = val;
				}
			}
			schema.virtual<string>("sample",virtualDefinition);

			expect(schema["virtuals"].sample).to.exist;
			expect(schema["virtuals"].sample).to.be.equal(virtualDefinition);
		});
	});
	
	describe("#set",function()
	{
		it("should work properly",function()
		{
			schema.set("test key","test value");
			expect(schema["config"]["test key"]).to.be.equal("test value");
		});
	});
	
	describe("#get",function()
	{
		before(function()
		{
			schema.set("test key","test value");
		});

		it("should work properly",function()
		{
			expect( schema.get("test key") ).to.be.equal("test value");
		});

		it("should return falsy on nonexistent keys values",function()
		{
			expect(schema.get("nonexistent key")).to.not.be.ok;
		});
	});

	describe("#define",function()
	{
		it("should run properly",function()
		{
			expect(function()
			{
				schema.define(
				{
					name : String,
					age  : Number
				},
				{
					"sample config" : "config"
				});
			}).to.not.throw();
		});

		it("config should be saved",function()
		{
			expect(schema.get("sample config")).to.be.equal("config");
		});
	});

	describe("#register",function()
	{
		it("should run properly",function()
		{
			expect(()=>
			{
				schema.register();
			}).to.not.throw();
		});
	});


});