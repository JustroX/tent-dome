import { TentDome, Tent } from "../index";
import { Model} from "../components/model";
import { assert, expect } from "chai";
import { spy } from "sinon";

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

	describe("#install",function()
	{
		let Tent = new TentDome();
		let samplePlugin = { initGlobal : ()=>{} , name :"sample", dependencies : [] };
		it("should save plugin on `plugins` store plugin",function()
		{
			Tent.install( samplePlugin );
			expect(Tent.plugins.sample).to.exist;
		});
	});

	describe("#register",function()
	{
		let Tent = new TentDome();
		let samplePlugin : any = { initGlobal : ()=>{}, name : "sample" , dependencies : [] };
		let pluginSpy = spy(samplePlugin,"initGlobal");
		Tent.install( samplePlugin );

		it('should throw when namespace is unavailable',function()
		{
			expect(function(){
				Tent.install( samplePlugin );
			});
		});

		it("should call `initGlobal` of the plugin",function()
		{
			Tent.register();
			expect(pluginSpy.calledOnce).to.be.equal(true);
		});

		it("should add `app`",function()
		{
			expect(samplePlugin.app).to.be.equal(Tent.app());
		});
	});



	describe("#start",function()
	{
		let Tent = new TentDome();
		let model = Tent.Entity<any>( "sample" , { name : String });

		Tent.init({
			"mongodb uri" :process.env.TEST_MONGODB_URI
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


//built-in plugins
import "./components/plugins/sanitation.spec";
import "./components/plugins/validation.spec";
import "./components/plugins/authentication.spec";

// //integration without plugins
// import "./integration.spec";