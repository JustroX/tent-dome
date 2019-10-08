import { assert, expect, use } from "chai";
import { promisify } from "../../util";
import { AuthenticationPlugin } from "../../../components/plugins/authentication";
import { Model } from "../../../components/model";
import { TentDome , Tent as TentGlobal } from "../../../index";
import { Accessor, Dispatcher } from "../../../components/routes/accessor";


import { createRequest, createResponse } from "node-mocks-http";
import { spy } from "sinon";

describe("Authentication Plugin",function()
{
	let authPlugin : AuthenticationPlugin;
	let model : Model<any>;

	before(function()
	{
		model   = new Model<any>("Super");
		model.define({
			name : String,
			age  : Number
		});

		model.Schema.method("hello",function()
		{
			return { val : "hello" };
		});

		model.Routes.create();
		model.Routes.update();
	});

	describe("#constructor",function()
	{		
		it("should not throw",function()
		{
			expect(()=>
			{
				authPlugin = new AuthenticationPlugin();
				model.install(authPlugin);
			}).to.not.throw();
		});

		it("should be a valid global plugin",function()
		{
			expect(authPlugin.name).to.exist;
			expect(authPlugin.dependencies).to.exist;
		});

		it('should have #allow function',function()
		{
			expect(authPlugin.allow).to.exist;
		});

		it('should have default endpoint functions',function()
		{
			expect(authPlugin.create).to.exist;
			expect(authPlugin.read).to.exist;
			expect(authPlugin.update).to.exist;
			expect(authPlugin.delete).to.exist;
			expect(authPlugin.list).to.exist;
		});

		it('should have method and static functions',function()
		{
			expect(authPlugin.method).to.exist;
			expect(authPlugin.static).to.exist;
		});

		it('should have `onFail` function',function()
		{
			expect(authPlugin.onFail).to.exist;
		});

		it('should have `failHandler` middleware',function()
		{
			expect(authPlugin.failHandler).to.exist;
		});

		it('should have `authMiddleware` middleware',function()
		{
			expect(authPlugin.authMiddleware).to.exist;
		});

		it('should have `onAuth` function',function()
		{
			expect(authPlugin.onAuth).to.exist;
		});

		it('should have `init` function',function()
		{
			expect(authPlugin.init).to.exist;
		});
	});

	describe("#allow",function()
	{
		it('should save non-authenticated endpoints in `nonAuth` store ',function()
		{	
			authPlugin.allow("/cats","GET");
			expect( authPlugin.noAuth ).to.be.deep.equal([ { endpoint : "/cats", method: "GET" } ]);
		});
	});

	describe("Default endpoints",function()
	{
		describe("CRUD+L operations",function()
		{
			beforeEach(function()
			{
				authPlugin.noAuth = [];
			});
			describe("#create",function()
			{
				it("should add data on `noAuth` store.",function()
				{
					authPlugin.create();
					expect(authPlugin.noAuth).to.be.deep.equal([ { endpoint : "/", method: "POST" } ]);
				});
			});
			describe("#read",function()
			{
				it("should add data on `noAuth` store.",function()
				{
					authPlugin.read();
					expect(authPlugin.noAuth).to.be.deep.equal([ { endpoint : "/", method: "GET" } ]);
				});
			});
			describe("#update",function()
			{
				it("should add data on `noAuth` store.",function()
				{
					authPlugin.update();
					expect(authPlugin.noAuth).to.be.deep.equal([ { endpoint : "/", method: "PUT" } ]);
				});
			});
			describe("#list",function()
			{
				it("should add data on `noAuth` store.",function()
				{
					authPlugin.list();
					expect(authPlugin.noAuth).to.be.deep.equal([ { endpoint : "/", method: "LIST" } ]);
				});
			});
			describe("#delete",function()
			{
				it("should add data on `noAuth` store.",function()
				{
					authPlugin.delete();
					expect(authPlugin.noAuth).to.be.deep.equal([ { endpoint : "/", method: "DELETE" } ]);
				});
			});
		});

		describe("Methods and Statics Operation",function()
		{
			beforeEach(function()
			{
				authPlugin.noAuth = [];
			});

			it("#method",function()
			{
				authPlugin.method("hello","PUT");
				expect(authPlugin.noAuth).to.be.deep.equal([{ endpoint: "/do/hello" , method: "PUT" }]);
			});

			it("#static",function()
			{
				authPlugin.static("hello","LIST");
				expect(authPlugin.noAuth).to.be.deep.equal([{ endpoint: "/do/hello" , method: "LIST" }]);
			});	
		});
	});

	describe("#failHandler",function()
	{
		let req = createRequest();
		let res = createResponse();
		let dispatcher = new Dispatcher(req,res);
		(res as any).tent = dispatcher
		
		it('should return status code of `403` whenever the user is unauthenticated.',function(done)
		{
			promisify(authPlugin.failHandler,req,res).then(()=>
			{
				try
				{
					expect(res._getStatusCode()).to.be.equal(403);
					expect(res._getData().error).to.be.equal("Forbidden.");
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done);
		});
	});
	describe("#authMiddleware",function()
	{
		let req = createRequest();
		let res = createResponse();
		let dispatcher = new Dispatcher(req,res);
		(res as any).tent = dispatcher
		
		it('should return status code of `403` whenever the user is unauthenticated.',function(done)
		{
			promisify(authPlugin.authMiddleware,req,res).then(()=>
			{
				try
				{
					expect(res._getStatusCode()).to.be.equal(403);
					expect(res._getData().error).to.be.equal("Forbidden.");
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done);
		});
		it('should not return status code of `403` whenever the user is authenticated.',function(done)
		{
			req.tent = { user: true };
			promisify(authPlugin.authMiddleware,req,res).then(done)
			.catch(done);
		});
	});

	describe("#init",function()
	{
		let AuthModel : Model<any>;
		before(function()
		{
			TentGlobal.init({
				"auth user"  : "AuthModel",
				"auth email token" : "email",
				"auth password token": "password",
				"auth secret": "ayiee...tumitingin"
			});

			AuthModel = TentGlobal.Entity("AuthModel",
			{
				email : String,
				password: String,
				roles : [ String]
			});

			AuthModel.register();
		})

		let spyBuilderCreate : any ;
		let spyBuilderUpdate : any;

		before(function()
		{
			spyBuilderCreate = spy( model.Routes.builder("/","POST") , "pre" );
			spyBuilderUpdate = spy( model.Routes.builder("/","PUT") , "pre" );
		});
		
		it('should not throw',function()
		{
			expect(function()
			{
				authPlugin.allow("/","PUT");
				model.register();
			}).to.not.throw();
		});

		it('should add jwt middleware',function()
		{
			expect( spyBuilderCreate.calledWith("model") ).to.be.equal(true);
			expect( spyBuilderUpdate.calledWith("model") ).to.be.equal(false);
		});
	});


	describe("#onFail",function()
	{
		it("should change the default #failHandler middleware.",function()
		{
			let newFailMiddleware = (req: any,res: any,next : any)=>{
				next();
			}
			authPlugin.onFail(newFailMiddleware);
			expect(authPlugin.failHandler).to.be.equal(newFailMiddleware);
		})
	});

	describe("#onAuth",function()
	{
		it("should change the default #authMiddleware middleware",function()
		{
			let newMiddleware = (req: any,res: any,next : any)=>{
				next();
			}
			authPlugin.onAuth(newMiddleware);
			expect(authPlugin.authMiddleware).to.be.equal(newMiddleware);
		});
	});
});	