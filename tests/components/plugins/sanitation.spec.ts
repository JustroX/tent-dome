import { Sanitation } from "../../../components/plugins/sanitation";
import { Accessor, Document }   from "../../../components/routes/accessor";
import { Model } from "../../../components/model";
import { assert, expect, use } from "chai";

import { createRequest, createResponse } from "node-mocks-http";
import { spy } from "sinon";


describe("Sanitation Plugin",function()
{
	let sanitationPlugin : Sanitation<any>;
	let model : Model<any>;

	before(function()
	{
		model   = new Model<any>("List");
		model.define({
			whitelist: Number,
			blacklist: Number,
			temp: Number,
		})
		model.register();
	});

	describe("#constructor",function()
	{
		it("should not throw",function()
		{
			expect(()=>
			{
				sanitationPlugin = new Sanitation<any>();
			}).to.not.throw();
		});

		it("should be a valid plugin",function()
		{
			expect(sanitationPlugin.name).to.exist;
			expect(sanitationPlugin.dependencies).to.exist;
		})

		it("should have `inbound` and `outbound` scopes",function()
		{
			expect(sanitationPlugin.inbound).to.exist;
			expect(sanitationPlugin.outbound).to.exist;
		});

		it("should have `inbound.whitelist` and `outbound.whitelist` scopes",function()
		{
			expect(sanitationPlugin.inbound.whitelist).to.exist;
			expect(sanitationPlugin.outbound.whitelist).to.exist;
		});

		it("should have `inbound.blacklist` and `outbound.blacklist` scopes",function()
		{
			expect(sanitationPlugin.inbound.blacklist).to.exist;
			expect(sanitationPlugin.outbound.blacklist).to.exist;
		});

		it("should have `inbound.whitelisted` and `outbound.whitelisted` scopes",function()
		{
			expect(sanitationPlugin.inbound.whitelisted).to.exist;
			expect(sanitationPlugin.outbound.whitelisted).to.exist;
		});

		it("should have `inbound.blacklisted` and `outbound.blacklisted` scopes",function()
		{
			expect(sanitationPlugin.inbound.blacklisted).to.exist;
			expect(sanitationPlugin.outbound.blacklisted).to.exist;
		});

		it("should have `inboundMiddleware` and `outboundMiddleware` scopes",function()
		{
			expect(sanitationPlugin.inboundMiddleware).to.exist;
			expect(sanitationPlugin.outboundMiddleware).to.exist;
		});
		
		it("`outboundMiddleware` and `outboundMiddleware`should have tags",function()
		{
			expect((sanitationPlugin.inboundMiddleware as any).tag).to.be.equal("inboundSanitation");
			expect((sanitationPlugin.outboundMiddleware as any).tag).to.be.equal("outboundSanitation");
		});

	});

	describe("#inbound.whitelist()",function()
	{
		it('should add new field in inbound whitelisted',function()
		{
			sanitationPlugin.inbound.whitelist("sample");
			expect(sanitationPlugin.inbound.whitelisted).to.be.deep.equal(["sample"]);
		});
		it('should add new field in inbound whitelisted as arrays',function()
		{
			sanitationPlugin.inbound.whitelist(["sample1","sample2"]);
			expect(sanitationPlugin.inbound.whitelisted).to.be.deep.equal(["sample","sample1","sample2"]);
		});
		it('should throw when blacklisted is not empty',function()
		{
			sanitationPlugin.inbound.blacklisted = ["sample"];
			expect(function()
			{
				sanitationPlugin.inbound.whitelist("sample");
			}).to.throw().property("name","AssertionError");
		});
	});

	describe("#inbound.blacklist()",function()
	{
		before(function()
		{
			sanitationPlugin.inbound.whitelisted = [];
			sanitationPlugin.inbound.blacklisted = [];
		});
		it('should add new field in inbound blacklisted',function()
		{
			sanitationPlugin.inbound.blacklist("sample");
			expect(sanitationPlugin.inbound.blacklisted).to.be.deep.equal(["sample"]);
		});
		it('should add new field in inbound blacklisted as arrays',function()
		{
			sanitationPlugin.inbound.blacklist(["sample1","sample2"]);
			expect(sanitationPlugin.inbound.blacklisted).to.be.deep.equal(["sample","sample1","sample2"]);
		});
		it('should throw when whitelisted is not empty',function()
		{
			sanitationPlugin.inbound.whitelisted = ["sample"];
			expect(function()
			{
				sanitationPlugin.inbound.whitelist("sample");
			}).to.throw().property("name","AssertionError");
		});
	});

	describe("#outbound.whitelist()",function()
	{
		it('should add new field in outbound whitelisted',function()
		{
			sanitationPlugin.outbound.whitelist("sample");
			expect(sanitationPlugin.outbound.whitelisted).to.be.deep.equal(["sample"]);
		});
		it('should add new field in outbound whitelisted as arrays',function()
		{
			sanitationPlugin.outbound.whitelist(["sample1","sample2"]);
			expect(sanitationPlugin.outbound.whitelisted).to.be.deep.equal(["sample","sample1","sample2"]);
		});
		it('should throw when blacklisted is not empty',function()
		{
			sanitationPlugin.outbound.blacklisted = ["sample"];
			expect(function()
			{
				sanitationPlugin.outbound.blacklist("sample");
			}).to.throw().property("name","AssertionError");
		});
	});

	describe("#outbound.blacklist()",function()
	{
		before(function()
		{
			sanitationPlugin.outbound.whitelisted = [];
			sanitationPlugin.outbound.blacklisted = [];
		});
		it('should add new field in outbound blacklisted',function()
		{
			sanitationPlugin.outbound.blacklist("sample");
			expect(sanitationPlugin.outbound.blacklisted).to.be.deep.equal(["sample"]);
		});
		it('should add new field in outbound blacklisted as arrays',function()
		{
			sanitationPlugin.outbound.blacklist(["sample1","sample2"]);
			expect(sanitationPlugin.outbound.blacklisted).to.be.deep.equal(["sample","sample1","sample2"]);
		});
		it('should throw when whitelisted is not empty',function()
		{
			sanitationPlugin.outbound.whitelisted = ["sample"];
			expect(function()
			{
				sanitationPlugin.outbound.blacklist("sample");
			}).to.throw().property("name","AssertionError");
		});
	});

	describe("#inboundMiddleware",function()
	{
		let req = createRequest();
		let res = createResponse();

		beforeEach(function()
		{
			sanitationPlugin.inbound.blacklisted = [];
			sanitationPlugin.inbound.whitelisted = [];
			req.body = 
			{
				whitelist : 1,
				blacklist : 2,
				temp	  : 3
			};
		});

		it('should whitelist',function(done)
		{
			sanitationPlugin.inbound.whitelist("whitelist");
			sanitationPlugin.inboundMiddleware()(req,res,function()
			{
				try
				{
					expect(req.body).to.be.deep.equal({ whitelist: 1 });
					done();
				}
				catch(err)
				{
					done(err);
				}
			});
		});

		it('should blacklist',function(done)
		{
			sanitationPlugin.inbound.blacklist("blacklist");
			sanitationPlugin.inboundMiddleware()(req,res,function()
			{
				try
				{
					expect(req.body).to.be.deep.equal({ whitelist: 1, temp: 3 });
					done();
				}
				catch(err)
				{
					done(err);
				}
			});
		});
	});

	describe("#outboundMiddleware",function()
	{
		let req = createRequest();
		let res = createResponse();
		
		before(function()
		{
			req.body = 
			{
				whitelist : 1,
				blacklist : 2,
				temp	  : 3
			};

			req.tent = new Accessor<any>(req,res);
			(req.tent as Accessor<any>).Model("List");
			(req.tent as Accessor<any>).FreshDocument();
			req.tent.payload = req.body;
			(req.tent as Accessor<any>).Assign();
		});

		beforeEach(function()
		{
			req.body = 
			{
				whitelist : 1,
				blacklist : 2,
				temp	  : 3
			};
			sanitationPlugin.outbound.blacklisted = [];
			sanitationPlugin.outbound.whitelisted = [];
			(req.tent as Accessor<any>).FreshDocument();
			(req.tent as Accessor<any>).Sanitize(req.body);
			(req.tent as Accessor<any>).Assign();
		});

		it('should whitelist',function(done)
		{
			sanitationPlugin.outbound.whitelist("whitelist");
			sanitationPlugin.outboundMiddleware()(req,res,function()
			{
				try
				{
					let document = (req.tent as Accessor<any>).document as Document<any>; 
					expect( document.whitelist ).to.be.equal(1);
					done();
				}
				catch(err)
				{
					done(err);
				}
			});
		});

		it('should blacklist',function(done)
		{
			sanitationPlugin.outbound.blacklist("blacklist");
			sanitationPlugin.outboundMiddleware()(req,res,function()
			{
				try
				{
					let document = (req.tent as Accessor<any>).document as Document<any>; 
					expect( document.whitelist ).to.be.equal(1);
					expect( document.temp ).to.be.equal(3);
					done();
				}
				catch(err)
				{
					done(err);
				}
			});
		});


		it('should whitelist lists',function(done)
		{
			(req.tent as Accessor<any>).list = 
			[
				req.tent.document as Document<any>,
			]; 
			sanitationPlugin.outbound.whitelist("whitelist");
			sanitationPlugin.outboundMiddleware()(req,res,function()
			{
				try
				{
					console.log
					let list = (req.tent as Accessor<any>).list as Document<any>[]; 
					expect(list[0].whitelist).to.be.equal( 1 );
					done();
				}
				catch(err)
				{
					done(err);
				}
			});
		});

		it('should blacklist lists',function(done)
		{
			(req.tent as Accessor<any>).list = 
			[
				req.tent.document as Document<any>,
			]; 
			sanitationPlugin.outbound.blacklist("blacklist");
			sanitationPlugin.outboundMiddleware()(req,res,function()
			{
				try
				{
					let list = (req.tent as Accessor<any>).list as Document<any>[]; 
					expect(list[0].whitelist).to.be.equal( 1 );
					expect(list[0].temp).to.be.equal( 3 );
					done();
				}
				catch(err)
				{
					done(err);
				}
			});
		});
	});

	describe("#init",function()
	{		
		let modelPostSpy : any;
		let modelPutSpy  : any;
		let modelGetSpy  : any;
		let modelListSpy : any;

		let middlewareInboundSpy : any;
		let middlewareOutboundSpy : any;

		before(function()
		{
			model = new Model<any>("List2");
			model.install(sanitationPlugin);

			model.Routes.create();
			model.Routes.update();
			model.Routes.read();
			model.Routes.list();
			model.Routes.delete();

			modelPostSpy = spy(model.Routes.builder("/","POST"),"post")
			modelPutSpy  = spy(model.Routes.builder("/","PUT") ,"post")
			modelGetSpy   = spy(model.Routes.builder("/","GET")  ,"pre")
			modelListSpy  = spy(model.Routes.builder("/","LIST") ,"pre")

			middlewareInboundSpy = spy(sanitationPlugin,"inboundMiddleware");
			middlewareOutboundSpy = spy(sanitationPlugin,"outboundMiddleware");

			model.register();
		});

		it("should add inbound middleware on methods `POST` and `PUT` after `model` middleware",function()
		{

			let inboundSpy  = spy()

			expect(modelPostSpy.args[0][0] == "model" ).to.be.equal(true);
			expect(modelPutSpy .args[0][0] == "model" ).to.be.equal(true);

			expect(modelPostSpy.args[0][1] ).to.be.a("function");
			expect(modelPutSpy .args[0][1] ).to.be.a("function");

			expect(middlewareInboundSpy.callCount).to.be.equal(2);

		});

		it("should add outbound middleware on methods `GET` before `present` and `show` middleware",function()
		{

			expect(modelGetSpy .args[0][0] == "show" ).to.be.equal(true);
			expect(modelListSpy.args[0][0] == "present" ).to.be.equal(true);

			expect(modelGetSpy .args[0][1]).to.a("function");
			expect(modelListSpy.args[0][1]).to.a("function");

			expect(middlewareOutboundSpy.callCount).to.be.equal(2);
		});

	});
})