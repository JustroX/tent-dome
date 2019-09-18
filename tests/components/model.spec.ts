import { Model, get, RegisterModels } from "../../components/model";
import { assert, expect } from "chai";
import * as Express from "express";
import { todo } from "../util";


//Preconditions

import "./schema.spec";

// import "./method";
// import "./validation";
// import "./permission";



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

		it('should be ok',function()
		{
			model = new Model<SampleSchema>(MODEL_NAME);
		});

		
		describe('.name',function()
		{
			it('should be the same',function()
			{
				expect(model.name).to.be.equal(MODEL_NAME);
			});
		});
		
		describe('.dbname',function()
		{
			it('should be the pluralized',function()
			{
				expect(model.dbname).to.be.equal("Samples");
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
	});

	describe("#RegisterModels",function()
	{
		let app;
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
