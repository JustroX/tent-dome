import { Routes, RegisterRoute } from "../../components/route";
import { Builder } from "../../components/routes/builder";
import { Middlewares } from "../../components/routes/middlewares";

import { assert, expect } from "chai";
import { todo } from "../util";
import { Router } from "express";

import { spy } from "sinon";

//precondition
import "./routes/builder.spec";

describe("Routes",function()
{
	describe("#RegisterRoute",function()
	{
		let route : Router;
		it("should not throw error",function()
		{
			expect(function()
			{
				route = RegisterRoute();
			}).to.not.throw();
		});
		it("should return a router",function()
		{
			expect(route.name).to.be.equal("router");
		});
	});

	describe("Route Class",function()
	{
		let route : Routes<any>;
		describe("#constructor",function()
		{
			it("should work properly",function()
			{
				expect(function()
				{
					route = new Routes("SampleRoute");
				}).to.not.throw();
			});

			it("name should be saved",function()
			{
				expect(route.name).to.be.equal("SampleRoute");
			});

			it("should create new router",function()
			{
				expect(route.router.name).to.be.equal("router");
			});

		});

		describe("#builder",function()
		{
			let builder : Builder<any>;
			it("should return the builder",function()
			{
				builder = route.endpoint("sample1","GET");
				expect(route.builder("sample1","GET")).to.be.equal(builder);	
			})
			it("should throw when builder is missing",function()
			{
				expect(function()
				{
					route.builder("sample3","GET")
				}).to.throw().property("name","AssertionError");	
			})
		});

		describe("#expose",function()
		{
			it("should expose the router",function()
			{
				expect(route.expose()).to.be.equal(route.router);
			});
		});

		describe("#endpoint",function()
		{
			let builder : Builder<any>;
			it('should create new builder',function()
			{
				builder = route.endpoint("sample","GET");
				expect(route.builders.map(x=>x.builder)).to.include(builder);
			});
			
			it('should return the builder',function()
			{
				expect(builder).to.be.an.instanceof(Builder);
			});
		});



		describe("#register",function()
		{
			afterEach(function()
			{
				route = new Routes<any>("SampleRoute");
			});

			it('should not throw',function()
			{
				expect(function()
				{
					route.register();
				}).to.not.throw();
			});

			it('should register LIST',function()
			{
				let routerSpy = spy( route.router , "get" );
				route.endpoint("sample","LIST").success();

				expect(routerSpy.calledWith("sample"));
			});
			it('should register POST',function()
			{
				let routerSpy = spy( route.router , "post" )
				route.endpoint("sample","POST").success();

				expect(routerSpy.calledWith("sample"));
			});
			it('should register GET',function()
			{
				let routerSpy = spy( route.router , "get" )
				route.endpoint("sample","GET").success();

				expect(routerSpy.calledWith("sample/:id"));
			});
			it('should register PUT',function()
			{
				let routerSpy = spy( route.router , "put" )
				route.endpoint("sample","PUT").success();

				expect(routerSpy.calledWith("sample/:id"));
			});
			it('should register DELETE',function()
			{
				let routerSpy = spy( route.router , "delete" )
				route.endpoint("sample","DELETE").success();

				expect(routerSpy.calledWith("sample/:id"));
			});
		});



		describe("Default builders",function()
		{		
			afterEach(function()
			{
				(route.endpoint as any).restore();
			});

			describe("#create",function()
			{
				it('should create the proper endpoint',function()
				{
					let endpiontSpy = spy( route, "endpoint" );

					let builder = route.create();
					expect(endpiontSpy.calledWith(route.name, "POST"));
					expect(builder.expose().map(x=>x.name)).to.be.deep.equal([
						Middlewares.model("endpoint"),
						Middlewares.create(),
						Middlewares.sanitize(),
						Middlewares.assign(),
						Middlewares.save(),
						Middlewares.show()
					].map(x=>x.name));
				});
			});
			describe("#update",function()
			{
				it('should create the proper endpoint',function()
				{
					let endpiontSpy = spy( route, "endpoint" );

					let builder = route.update();
					expect(endpiontSpy.calledWith(route.name, "PUT"));
					expect(builder.expose().map(x=>x.name)).to.be.deep.equal([
						Middlewares.model("endpoint"),
						Middlewares.read(),
						Middlewares.sanitize(),
						Middlewares.assign(),
						Middlewares.save(),
						Middlewares.show()
					].map(x=>x.name));					
				});
			});
			describe("#read",function()
			{
				it('should create the proper endpoint',function()
				{
					let endpiontSpy = spy( route, "endpoint" );

					let builder = route.read();
					expect(endpiontSpy.calledWith(route.name, "GET"));
					expect(builder.expose().map(x=>x.name)).to.be.deep.equal([
						Middlewares.model("endpoint"),
						Middlewares.read(),
						Middlewares.show()
					].map(x=>x.name));					
				});
			});
			describe("#list",function()
			{
				it('should create the proper endpoint',function()
				{
					let endpiontSpy = spy( route, "endpoint" );

					let builder = route.list();
					expect(endpiontSpy.calledWith(route.name, "LIST"));
					expect(builder.expose().map(x=>x.name)).to.be.deep.equal([
						Middlewares.model("endpoint"),
						Middlewares.param(),
						Middlewares.list(),
						Middlewares.present()
					].map(x=>x.name));

				});
			});
			describe("#delete",function()
			{
				it('should create the proper endpoint',function()
				{
					let endpiontSpy = spy( route, "endpoint" );

					let builder = route.delete();
					expect(endpiontSpy.calledWith(route.name, "DELETE"));
					expect(builder.expose().map(x=>x.name)).to.be.deep.equal([
						Middlewares.model("endpoint"),
						Middlewares.read(),
						Middlewares.remove(),
						Middlewares.success()
					].map(x=>x.name));
				});
			});
			describe("#method",function()
			{
				it('should create the proper endpoint',function()
				{
					let endpiontSpy = spy( route, "endpoint" );

					let builder = route.method("dummy","PUT");
					expect(endpiontSpy.calledWith(route.name+":id/do/dummy", "PUT"));
					expect(builder.expose().map(x=>x.name)).to.be.deep.equal([
						Middlewares.model("endpoint"),
						Middlewares.read(),
						Middlewares.method("dummy"),
						Middlewares.return()
					].map(x=>x.name));
				});
			});
			describe("#static",function()
			{
				it('should create the proper endpoint',function()
				{
					let endpiontSpy = spy( route, "endpoint" );

					let builder = route.static("dummy","LIST");
					expect(endpiontSpy.calledWith(route.name+"/do/dummy", "LIST"));
					expect(builder.expose().map(x=>x.name)).to.be.deep.equal([
						Middlewares.model("endpoint"),
						Middlewares.static("dummy"),
						Middlewares.return()
					].map(x=>x.name));
				});
			});
		});



	});
});