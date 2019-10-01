import { Schema } from "../../components/schema";
import { assert, expect } from "chai";
import { todo } from "../util";
import { Document } from "mongoose";

describe("Schema",function()
{
	interface SampleSchema extends Document
	{
		name : string,
		age  : number
	}
	var schema : Schema<SampleSchema>;
	describe("#constructor",function()
	{
		schema = new Schema<SampleSchema>("sample");
		it('should assign a name',function()
		{
			expect(schema["name"]).to.be.equal('sample');
		});

		it("should have a `method` method",function()
		{
			expect(schema["method"]).to.exist;
		});
		
		it("should have a `static` method",function()
		{
			expect(schema["static"]).to.exist;
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

	describe("#method",function()
	{
		it('should save it in the `methods` store',function()
		{
			let dummy_function = function(){};
			schema.method("dummy",dummy_function);
			expect(schema.methods["dummy"]).to.be.equal(dummy_function);
		});
	});

	describe("#static",function()
	{
		it('should save it in the `statics` store',function()
		{
			let dummy_function = function(){};
			schema.static("dummy",dummy_function);
			expect(schema.statics["dummy"]).to.be.equal(dummy_function);
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
		it("should add `mongooseSchema on scope`",function()
		{
			expect(schema.mongooseSchema).to.exist;
		});
		it("should add `model on scope`",function()
		{
			expect(schema.model).to.exist;
		});
	});



});