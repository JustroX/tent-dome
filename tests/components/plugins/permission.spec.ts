import { Tent, TentDome } from "../../../index";
import { Permission } from "../../../components/plugins/permission";
import { AuthenticationPlugin } from "../../../components/plugins/authentication";
import { Model , get } from "../../../components/model";
import { Dispatcher  } from "../../../components/routes/accessor";
import { assert, expect, use } from "chai";
import { promisify } from "../../util";
import { spy as sinonSpy, SinonSpy } from "sinon";
import { createRequest, createResponse } from "node-mocks-http";

describe("#Permission",function()
{
	let permission : Permission;
	let spy : SinonSpy;
	describe("#constructor",function()
	{
		it('should not throw',function()
		{
			expect(function()
			{
				permission = new Permission();
				spy = sinonSpy(permission,"endpoint");
			}).to.not.throw();
		})
		it('should have `endpoint` function',function()
		{
			expect(permission.endpoint).to.exist;
		});
		it('should have `create` function',function()
		{
			expect(permission.create).to.exist;
		});
		it('should have `read` 	function',function()
		{
			expect(permission.read).to.exist;		
		});
		it('should have `list` function',function()
		{
			expect(permission.list).to.exist;
		});
		it('should have `update` function',function()
		{
			expect(permission.update).to.exist;
		});
		it('should have `delete` function',function()
		{
			expect(permission.delete).to.exist;
		});
		it('should have `method` function',function()
		{
			expect(permission.method).to.exist;
		});
		it('should have `static` function',function()
		{
			expect(permission.static).to.exist;
		});

		it('should have `init` function',function()
		{
			expect(permission.init).to.exist;
		})
		it('should have `permissionMiddlewareFactory` function',function()
		{
			expect(permission.permissionMiddlewareFactory).to.exist;
		})
	});

	describe("#endpoint",function()
	{
		it('should have `endpoints` store dictionary.',function()
		{
			expect(permission.endpoints).to.exist;
		});
		it('should save endpoint details on `endpoints` store.',function()
		{
			permission.endpoint("/sample","GET",["bystander"]);
			expect(permission.endpoints["/sample-GET"]).to.be.eql({
				endpoint: "/sample",
				method  : "GET",
				allow 	: ["bystander"]
			});
		});
		it('should save endpoint details on `endpoints` store with non array argument',function()
		{
			permission.endpoint("/sample","GET","sample");
			expect(permission.endpoints["/sample-GET"]).to.be.eql({
				endpoint: "/sample",
				method  : "GET",
				allow 	: ["bystander","sample"]
			});
		});
		it('should append role on the `endpoints` store.',function()
		{
			permission.endpoint("/sample","GET",["super"]);		
			expect(permission.endpoints["/sample-GET"]).to.be.eql({
				endpoint: "/sample",
				method  : "GET",
				allow 	: ["bystander","sample","super"]
			});
		});
	});

	describe("#create",function()
	{
		it('should call `endpoint` with "/" and "POST" arguments ',function()
		{
			let sampleRole = ["sample"];
			permission.create(sampleRole);
			expect(spy.calledWith("/","POST",sampleRole));
		});
	});
	describe("#read",function()
	{
		it('should call `endpoint` with "/" and "GET" arguments ',function()
		{
			let sampleRole = ["sample"];
			permission.read(sampleRole);
			expect(spy.calledWith("/","GET",sampleRole));
		});
	});
	describe("#update",function()
	{
		it('should call `endpoint` with "/" and "PUT" arguments ',function()
		{
			let sampleRole = ["sample"];
			permission.update(sampleRole);
			expect(spy.calledWith("/","PUT",sampleRole));
		});
	});
	describe("#delete",function()
	{
		it('should call `endpoint` with "/" and "DELETE" arguments ',function()
		{
			let sampleRole = ["sample"];
			permission.delete(sampleRole);
			expect(spy.calledWith("/","DELETE",sampleRole));
		});
	});
	describe("#list",function()
	{
		it('should call `endpoint` with "/" and "LIST" arguments ',function()
		{
			let sampleRole = ["sample"];
			permission.list(sampleRole);
			expect(spy.calledWith("/","LIST",sampleRole));
		});
	});

	describe("#method",function()
	{
		it('should call `endpoint` with "/do/{method}" and {request method} arguments ',function()
		{
			let sampleRole = ["sample"];
			permission.method("method","PUT",sampleRole);
			expect(spy.calledWith("/do/method","PUT",sampleRole));
		});
	});
	describe("#static",function()
	{
		it('should call `endpoint` with "/do/{static}" and {request method}  arguments ',function()
		{
			let sampleRole = ["sample"];
			permission.static("static","LIST",sampleRole);
			expect(spy.calledWith("/do/static","LIST",sampleRole));			
		});
	});

	describe("#init",function()
	{
		let model : Model<any>;

		before(function()
		{
			permission.endpoints = {};
			model  = Tent.Entity<any>("PermissionAuth",
			{
				name : String
			});

			model.Routes.create();
			model.Routes.update();

			model.install(new AuthenticationPlugin());
			model.install(permission);

			let perm : any = model.plugins.permission;
			perm.create(["bystander","super"]);

		});

		it("should throw when `permission payload role` is not defined ",function()
		{
			expect(()=>
			{
				permission.init();
			}).to.throw().property("name","AssertionError");
		});

		it("should not throw",function()
		{
			expect(()=>
			{
				Tent.set<string>("permission payload role","role");
				model.register();
			}).to.not.throw();
		})

		it("should add middleware after auth plugin",function()
		{
			let mw : any =model.Routes.builder("/","POST").expose()[3];
			expect(mw.tag).to.be.equal("permission");
			expect(mw.name).to.be.eql(permission.permissionMiddlewareFactory("/","POST").name);
		});
	});


	describe("#permissionMiddlewareFactory",function()
	{
		let req = createRequest();
		let res = createResponse();
		let mw : any;
		before(function()
		{
			(res as any).tent  = new Dispatcher(req,res);
			mw = permission.permissionMiddlewareFactory("/","POST");
		});


		it("should not allow users with no permission",function(done)
		{
			promisify(mw,req,res).then(()=>
			{
				try{
					expect( res._getStatusCode() ).to.be.equal(403);
					done();
				}
				catch(err){done(err)};
			})
			.catch(done);
		});

		it("should not allow users with invalid permissions",function(done)
		{
			req.user = { role:["unknownrole"] };

			promisify(mw,req,res).then(()=>
			{
				try{
					expect( res._getStatusCode() ).to.be.equal(403);
					done();
				}
				catch(err){done(err)};
			})
			.catch(done);
		});

		it("should allow users with valid permissions",function(done)
		{
			req.user = { role:["super"] };

			promisify(mw,req,res).then(()=>
			{
				done();
			})
			.catch(done);
		});


	});

});