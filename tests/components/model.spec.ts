import { Model, get, RegisterModels } from "../../components/model";

import { Routes } from "../../components/route";
import { Expand } from "../../components/expand";
import { Schema } from "../../components/schema";
import { Plugin } from "../../components/plugin";


import { assert, expect } from "chai";
import Express = require("express");
import { todo } from "../util";


//Preconditions

import "./expand.spec";
import "./schema.spec";
import "./plugin.spec";

describe("Model",function()
{
	const MODEL_NAME = "Sample";
	interface SampleSchema
	{
		name : string,
		age  : number
	}

	var model : Model<SampleSchema>;
	
	describe("Model class",function()
	{

		describe('constructor',function()
		{
			it("should not throw",function()
			{
				expect(function()
				{
					model = new Model<SampleSchema>(MODEL_NAME);
				}).to.not.throw();				
			});

			it("should have .name",function()
			{
				expect(model.name).to.exist;
			});

			it('name should be the same',function()
			{
				expect(model.name).to.be.equal(MODEL_NAME);
			});

			it('should have .dbname',function()
			{
				expect(model.dbname).to.exist;
			});

			it('dbname should be the pluralized',function()
			{
				expect(model.dbname).to.be.equal("Samples");
			});

			it('should have a Route object ',function()
			{
				expect(model.Routes).to.exist;
				expect(model.Routes).to.be.an.instanceof(Routes)
			});

			it('should have a Schema object ',function()
			{
				expect(model.Schema).to.exist;
				expect(model.Schema).to.be.an.instanceof(Schema);
			});
			
			it('should have an Expand object ',function()
			{
				expect(model.Expand).to.exist;
				expect(model.Expand).to.be.an.instanceof(Expand);
			});

			it('should have an 	`install()` function',function()
			{
				expect(model.install).to.exist;
				expect(model.install).to.be.a('function')
			})

			it('should have a `plugins` store',function()
			{
				expect(model.plugins).to.exist;
				expect(model.plugins).to.be.deep.equal({});
			});

		});

		describe('#define',function()
		{
			it("should not throw error",()=>
			{
				expect(function()
				{
					model.define({
						name : String,
						age  : Number
					},
					{
						"test config" : "test value"
					});
				}).to.not.throw();
				
			});
		});

		describe('#register',function()
		{
			it('should not throw error',()=>
			{
				expect(function()
				{
					model.register()
				}).to.not.throw();
			});
		});

		describe("#install",function()
		{
			it('should throw if invalid plugin',function()
			{
				class SamplePlugin{
					constructor() {}
				}

				expect(function()
				{
					model.install(new SamplePlugin());
				}).to.throw().property("name","AssertionError");
			});

			it('should throw if already installed',function()
			{
				@Plugin({
					name : "sample",
					dependencies: []
				})
				class SamplePlugin{
					constructor() {}
					init(){}
				}
				model.plugins["sample"] = { name : "sample", dependencies: [], init: ()=>{} } ;
				expect(function()
				{
					model.install(new SamplePlugin());
				}).to.throw().property("name","AssertionError");
			});
			it('should throw if dependency is not installed',function()
			{
				@Plugin({
					name : "sample",
					dependencies: ["unavailable"]
				})
				class SamplePlugin{
					constructor() {}
					init(){}
				}
				expect(function()
				{
					model.install(new SamplePlugin());
				}).to.throw().property("name","AssertionError");
			});
			it('should not throw',function()
			{
				delete model.plugins["sample"];

				@Plugin({
					name : "sample",
					dependencies: []
				})
				class SamplePlugin{
					constructor() {}
					init(){}
				}
				expect(function()
				{
					model.install(new SamplePlugin());
				}).to.not.throw();
			})
			it('.plugins.pluginName must be exposed.',function()
			{
				delete model.plugins["sample"];

				if(!model["sample"])
					model["sample"] = undefined;
				
				@Plugin({
					name : "sample",
					dependencies: []
				})
				class SamplePlugin{
					constructor() {}
					init(){}
				}
				model.install(new SamplePlugin());
				expect( model.plugins["sample"] ).to.be.an.instanceof(SamplePlugin);
			});
		});
	});

	describe("#RegisterModels",function()
	{
		let app : any;
		before(function()
		{
			app  = Express();
		});

		it('should not throw',function()
		{
			expect(function()
			{
				RegisterModels(app);			
			}).to.not.throw();
		});
	});

	describe("#get",function()
	{		
		it('should be saved on model store dictionary',function()
		{
			expect(get(MODEL_NAME)).to.be.equal(model);
		});
	});

});


import "./routes.spec";
