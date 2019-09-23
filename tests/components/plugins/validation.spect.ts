import { Validation, ConstraintUtility } from "../../../components/plugins/validation";
import { Accessor, Document }   from "../../../components/routes/accessor";
import { Model } from "../../../components/model";
import { assert, expect, use } from "chai";

import { createRequest, createResponse } from "node-mocks-http";
import { spy } from "sinon";

import * as Joi from "joi";

describe("Validation Plugin",function()
{
	let validationPlugin : Validation;
	describe("#constructor",function()
	{
		it('should not throw',function()
		{
			expect(function()
			{
				validationPlugin = new Validation();
			}).to.not.throw();
		});

		it("should be a valid plugin",function()
		{
			expect(validationPlugin.name).to.exist;
			expect(validationPlugin.dependencies).to.exist;
		});

		it("should have a `joi` member",function()
		{
			expect(validationPlugin.joi).to.exist;
			expect(validationPlugin.joi).to.be.equal(Joi);
		})

		it("should have `definition` member",function()
		{
			expect(validationPlugin.definition).to.exist;
			expect(validationPlugin.definition).to.be.equal({});
		});

		it("should have `constraint` member",function()
		{
			expect(validationPlugin.constraint).to.exist;
			expect(validationPlugin.constraint).to.be.equal({});
		});

		it("should have `schema` method",function()
		{
			expect(validationPlugin.schema).to.exist;
			expect(validationPlugin.schema).to.be.a('function');
		});

		it("should have `validationMiddleware` method",function()
		{
			expect(validationPlugin.validationMiddleware).to.exist;
			expect(validationPlugin.validationMiddleware).to.be.a('function');
		});

		it("should have `onFail` method",function()
		{
			expect(validationPlugin.onFail).to.exist;
			expect(validationPlugin.onFail).to.be.a('function');
		});

		it("should have `onFailMiddlewareFactory` method",function()
		{
			expect(validationPlugin.onFailMiddlewareFactory).to.exist;
			expect(validationPlugin.onFailMiddlewareFactory).to.be.a('function');
		});
		it("should have `onFailMiddleware` method",function()
		{
			expect(validationPlugin.onFailMiddleware).to.exist;
			expect(validationPlugin.onFailMiddleware).to.be.a('function');
		});
	});

	describe("#schema",function()
	{
		let peerConstaints : any;
		it('should save schema to `definition`',function()
		{
			let a = 
			{
				name : Joi.alphanum().min(2).max(3),
				age  : Joi.number().min(18).max(22)
			};

			peerConstaints = validationPlugin.schema(a);

			expect(validationPlugin.definition).to.be.equal(a);
		});

		it('should return  a ConstraintUtilityt',function()
		{
			expect(peerConstaints).to.be.an.instanceof(ConstraintUtility);
		});

		describe("ConstraintUtility",function()
		{
			describe("constructor",function()
			{
				it('should have all peer related joi.Object functions',function()
				{
					expect(peerConstaints.and		).to.exist;
					expect(peerConstaints.nand		).to.exist;
					expect(peerConstaints.or		).to.exist;
					expect(peerConstaints.oxor		).to.exist;
					expect(peerConstaints.with		).to.exist;
					expect(peerConstaints.without	).to.exist;
					expect(peerConstaints.xor		).to.exist;
					expect(peerConstaints.and		).to.be.a('function');
					expect(peerConstaints.nand		).to.be.a('function');
					expect(peerConstaints.or		).to.be.a('function');
					expect(peerConstaints.oxor		).to.be.a('function');
					expect(peerConstaints.with		).to.be.a('function');
					expect(peerConstaints.without	).to.be.a('function');
					expect(peerConstaints.xor		).to.be.a('function');
				});
			});
			describe("#and",function()
			{
				it('should save on constraints',function()
				{
					peerConstaints.and("one","two","three");
					expect(validationPlugin.constraints).to.exist;
					expect(validationPlugin.constraints.and).to.exist;
					expect(validationPlugin.constraints.and.peers).to.exist;
					expect(validationPlugin.constraints.and.peers).to.be.eql([[ "one", "two", "three" ]]);
				});

				it('should append new constraints',function()
				{
					peerConstaints.and("one","two","three");
					expect(validationPlugin.constraints.and.peers).to.be.eql([[ "one", "two", "three" ],[ "one", "two", "three" ]]);
				});

				it('should append new constraints and add options',function()
				{
					let options = { sample : 3 };
					peerConstaints.and("one","two","three",options);
					expect(validationPlugin.constraints.and.peers).to.be.eql([[ "one", "two", "three" ],[ "one", "two", "three" ],[ "one", "two", "three" ]]);
					expect(validationPlugin.constraints.and.options).to.be.eql(options);
				});
			});
			describe("#nand",function()
			{
				it('should save on constraints',function()
				{
					peerConstaints.nand("one","two","three");
					expect(validationPlugin.constraints).to.exist;
					expect(validationPlugin.constraints.nand).to.exist;
					expect(validationPlugin.constraints.nand.peers).to.exist;
					expect(validationPlugin.constraints.nand.peers).to.be.eql([[ "one", "two", "three" ]]);
				});

				it('should append new constraints',function()
				{
					peerConstaints.nand("one","two","three");
					expect(validationPlugin.constraints.nand.peers).to.be.eql([[ "one", "two", "three" ],[ "one", "two", "three" ]]);
				});

				it('should append new constraints and add options',function()
				{
					let options = { sample : 3 };
					peerConstaints.nand("one","two","three",options);
					expect(validationPlugin.constraints.nand.peers).to.be.eql([[ "one", "two", "three" ],[ "one", "two", "three" ],[ "one", "two", "three" ]]);
					expect(validationPlugin.constraints.nand.options).to.be.eql(options);
				});
					
			});
			describe("#or",function()
			{
				it('should save on constraints',function()
				{
					peerConstaints.or("one","two","three");
					expect(validationPlugin.constraints).to.exist;
					expect(validationPlugin.constraints.or).to.exist;
					expect(validationPlugin.constraints.or.peers).to.exist;
					expect(validationPlugin.constraints.or.peers).to.be.eql([[ "one", "two", "three" ]]);
				});

				it('should append new constraints',function()
				{
					peerConstaints.or("one","two","three");
					expect(validationPlugin.constraints.or.peers).to.be.eql([[ "one", "two", "three" ],[ "one", "two", "three" ]]);
				});

				it('should append new constraints and add options',function()
				{
					let options = { sample : 3 };
					peerConstaints.or("one","two","three",options);
					expect(validationPlugin.constraints.or.peers).to.be.eql([[ "one", "two", "three" ],[ "one", "two", "three" ],[ "one", "two", "three" ]]);
					expect(validationPlugin.constraints.or.options).to.be.eql(options);
				});				
			});
			describe("#oxor",function()
			{
				it('should save on constraints',function()
				{
					peerConstaints.oxor("one","two","three");
					expect(validationPlugin.constraints).to.exist;
					expect(validationPlugin.constraints.oxor).to.exist;
					expect(validationPlugin.constraints.oxor.peers).to.exist;
					expect(validationPlugin.constraints.oxor.peers).to.be.eql([[ "one", "two", "three" ]]);
				});

				it('should append new constraints',function()
				{
					peerConstaints.oxor("one","two","three");
					expect(validationPlugin.constraints.oxor.peers).to.be.eql([[ "one", "two", "three" ],[ "one", "two", "three" ]]);
				});

				it('should append new constraints and add options',function()
				{
					let options = { sample : 3 };
					peerConstaints.oxor("one","two","three",options);
					expect(validationPlugin.constraints.oxor.peers).to.be.eql([[ "one", "two", "three" ],[ "one", "two", "three" ],[ "one", "two", "three" ]]);
					expect(validationPlugin.constraints.oxor.options).to.be.eql(options);
				});
					
				
			});
			describe("#with",function()
			{
				it('should save on constraints',function()
				{
					peerConstaints.with("one","three");
					expect(validationPlugin.constraints).to.exist;
					expect(validationPlugin.constraints.with).to.exist;
					expect(validationPlugin.constraints.with.one).to.exist;
					expect(validationPlugin.constraints.with.one).to.be.eql({ peers: ["three"] });
				});


				it('should append new constraints',function()
				{
					peerConstaints.with("one","two");
					expect(validationPlugin.constraints.with.one).to.be.eql({ peers: ["three","two"] });
				});

				it('should append new constraints list',function()
				{
					peerConstaints.with("one",["one","zero"]);
					expect(validationPlugin.constraints.with.one).to.be.eql({ peers: ["three","two","one","zero"] });
				});

				it('should append new constraints and add options',function()
				{
					let options = { sample : 3 };
					peerConstaints.nand("one","pi",options);
					expect(validationPlugin.constraints.with.one).to.be.eql({ peers: ["three","two","one","zero","pi"], options: options });
				});

				it('should append new constraints list and add options',function()
				{
					delete validationPlugin.constraints.with.one.options;
					let options = { sample : 3 };
					peerConstaints.nand("one",["pi","-1/12"],options);
					expect(validationPlugin.constraints.with.one).to.be.eql({ peers: ["three","two","one","zero","pi","-1/12"], options: options });
				});
					
				
			});
			describe("#without",function()
			{
				it('should save on constraints',function()
				{
					peerConstaints.without("one","three");
					expect(validationPlugin.constraints).to.exist;
					expect(validationPlugin.constraints.without).to.exist;
					expect(validationPlugin.constraints.without.one).to.exist;
					expect(validationPlugin.constraints.without.one).to.be.eql({ peers: ["three"] });
				});


				it('should append new constraints',function()
				{
					peerConstaints.without("one","two");
					expect(validationPlugin.constraints.without.one).to.be.eql({ peers: ["three","two"] });
				});

				it('should append new constraints list',function()
				{
					peerConstaints.without("one",["one","zero"]);
					expect(validationPlugin.constraints.without.one).to.be.eql({ peers: ["three","two","one","zero"] });
				});

				it('should append new constraints and add options',function()
				{
					let options = { sample : 3 };
					peerConstaints.nand("one","pi",options);
					expect(validationPlugin.constraints.without.one).to.be.eql({ peers: ["three","two","one","zero","pi"], options: options });
				});

				it('should append new constraints list and add options',function()
				{
					delete validationPlugin.constraints.without.one.options;
					let options = { sample : 3 };
					peerConstaints.nand("one",["pi","-1/12"],options);
					expect(validationPlugin.constraints.without.one).to.be.eql({ peers: ["three","two","one","zero","pi","-1/12"], options: options });
				});
					
				
				
			});
			describe("#xor",function()
			{
				it('should save on constraints',function()
				{
					peerConstaints.xor("one","two","three");
					expect(validationPlugin.constraints).to.exist;
					expect(validationPlugin.constraints.xor).to.exist;
					expect(validationPlugin.constraints.xor.peers).to.exist;
					expect(validationPlugin.constraints.xor.peers).to.be.eql([[ "one", "two", "three" ]]);
				});

				it('should append new constraints',function()
				{
					peerConstaints.xor("one","two","three");
					expect(validationPlugin.constraints.xor.peers).to.be.eql([[ "one", "two", "three" ],[ "one", "two", "three" ]]);
				});

				it('should append new constraints and add options',function()
				{
					let options = { sample : 3 };
					peerConstaints.xor("one","two","three",options);
					expect(validationPlugin.constraints.xor.peers).to.be.eql([[ "one", "two", "three" ],[ "one", "two", "three" ],[ "one", "two", "three" ]]);
					expect(validationPlugin.constraints.xor.options).to.be.eql(options);
				});
					
				
			});
		});
	});

	describe("#onFailMiddlewareFactory",function()
	{
		let mw;
		let req = createRequest();
		let res = createResponse();
		it('should return a middleware that will be called when validation fails',function()
		{
			mw = validationPlugin.onFailMiddlewareFactory();
			expect(mw).to.be.a('function');
		});
		it('should respond 400 - ValidationError`',function(done)
		{
			mw(req,res,function()
			{
				try
				{
					expect(res._getStatusCode()).to.be.equal(400);
					expect(res._getBody().message).to.be.equal("Validation Error");
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
		});
	});

	describe("#validationMiddleware factory",function()
	{
		let mw;
		let req = createRequest();
		let res = createResponse();
		let spiedFailFactory ;
		before(function()
		{
			spiedFailFactory = spy( validationPlugin , "onFailMiddlewareFactory" );
			req.tent.payload = 
			{
				name : "AB",
				age	 : 18
			};
		});

		it('should return a middleware',function()
		{
			mw = validationPlugin.validationMiddleware();
			expect(mw).to.be.a('function');
		});
		
		it('should return a middleware that adds `validation` object on `req.tent`',function(done)
		{
			mw(req,res,function()
			{
				try
				{
					expect(req.tent.validation).to.exist;
				}
				catch(err)
				{
					done(err);
				}
			});
		});
		
		it('should call onFail middleware when payload is invalid',function(done)
		{
			expect(spiedFailFactory.calledOnce()).to.be.equal(true);
		});
	});

	describe("#onFail",function()
	{
		it('should replace `onFailMiddlewareFactory`',function()
		{
			let a = function(){};
			validationPlugin.onFailMiddlewareFactory(a);
			expect(validationPlugin.onFailMiddlewareFactory).to.be.equal(a);
		});
	});

})