import { TentDome } from "../index";
import { Model} from "../components/model";
import { assert, expect } from "chai";

import mongoose = require("mongoose");




import { config } from "dotenv";
config();

//preconditions

import "./components/server.spec";
import "./components/model.spec";



describe("Tent",function()
{
	describe("Tent",function()
	{
		let Tent = new TentDome();
		it('should return an object',function()
		{
			expect(Tent).to.be.an('object');
		});
	});

	describe("Tent set()",function()
	{
		let Tent = new TentDome();	
		it('should equal TentOptions',function()
		{
			Tent.set<string>('sample string', 'hello');
			Tent.set<number>('sample number',  123	 );
			
			expect(Tent.TentOptions["sample string"]).to.equal('hello');
			expect(Tent.TentOptions["sample number"]).to.equal(123);	
		});

		it('should replace previous TentOptions',function()
		{
			Tent.set<string>('sample string', 'world');
			Tent.set<number>('sample number',  234	 );

			expect(Tent.TentOptions["sample string"]).to.equal('world');
			expect(Tent.TentOptions["sample number"]).to.equal(234);	
		});
	});

	describe("Tent get()",function()
	{
		let Tent = new TentDome();	
		Tent.set<string>('sample string', 'hello');
		Tent.set<number>('sample number',  123	 );
	
		it('should equal TentOptions',function()
		{		
			expect(Tent.get<string>('sample string')).to.equal('hello');
			expect(Tent.get<number>('sample number')).to.equal(123);	
		});

	});

	describe("#setDefaultOptions()",function()
	{
		let Tent = new TentDome();	
		it('should have default options',function()
		{
			Tent.setDefaultOptions();
			expect(Tent.TentOptions["api prefix"]).to.equal('api');	
		});
	});

	describe("#init()",function()
	{
		let Tent = new TentDome();
		it('should have default options',function()
		{
			Tent.init({});
			expect(Tent.TentOptions["api prefix"]).to.equal('api');
		});

		after(function()
		{
			Tent.AppServer.close();
		})
	});

	describe("#Entity",function()
	{
		let Tent = new TentDome();
		it('should return proper model',function()
		{
			let model = Tent.Entity<any>( "sample" , { name : String });
			expect(model).to.be.instanceof(Model);
		});
	});

	describe("#start",function()
	{
		let Tent = new TentDome();
		let model = Tent.Entity<any>( "sample" , { name : String });

		Tent.init({
			"mongoose uri" :process.env.TEST_MONGODB_URI
		});

		it('should not throw any error',function()
		{
			expect(function()
			{
				Tent.start();
			}).to.not.throw();
		});

		after(function()
		{
			Tent.AppServer.close();
		});
	});


	describe("#server",function()
	{
		let Tent = new TentDome();
		it('should return tent server',function()
		{
			expect(Tent.server()).to.be.equal( Tent.AppServer.server );
		});
	});


	describe("#app",function()
	{
		let Tent = new TentDome();
		it('should return tent app',function()
		{
			expect(Tent.app()).to.be.equal( Tent.AppServer.app );
		});

	});

});

import "./integration.spec";