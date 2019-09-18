import { Builder, BUILT_IN_FACTORIES } from "../../../components/routes/builder";
import { assert, expect } from "chai";
import { todo } from "../../util";

//preconditions
import "./middlewares.spec";

describe("Builder",function()
{
	const BUILDER_NAME = "Sample Builder";
	let builder;

	let sample_middleware = function(req,res,next)
	{
		req.token = true;
		next();
	}

	describe("#constructor",function()
	{
		it('should not throw',function()
		{
			expect(function()
			{
				builder = new Builder(BUILDER_NAME,{ "import builtin" : false });
			}).to.not.throw();
		});
	});

	describe("#define",function()
	{
		it('should not throw',function()
		{
			expect(function()
			{
				builder.define("sample",sample_middleware);
			}).to.not.throw();

		});

		it('should create a class function',function()
		{
			expect(builder.sample).to.exist;
		});

		it('should throw when middleware is already defined',function()
		{
			expect(function()
			{
				builder.define("sample",()=>{});
			}).to.throw("Builder pipe is already defined");
		});


		describe("#define:sample",function()
		{
			it('the middlware should be inserted in the head',function()
			{
				builder.sample();
				expect(typeof builder.middlewares[0]).to.be.equal("function");
				expect(builder.middlewares[0] === sample_middleware).to.be.equal(true);
			});

			it('head should move',function()
			{
				builder.sample();
				expect(builder.head).to.be.equal(2);
				expect(typeof builder.middlewares[1]).to.be.equal("function");
				expect(builder.middlewares[1] === sample_middleware).to.be.equal(true);
			});

			it('should return this to enable chaining',function()
			{
				let a = builder.sample();
				expect(a).to.be.equal(builder);
			})

			after(function()
			{
				builder.middlewares = [];
				builder.head = 0;
			});
		});

	});
	
	describe("#importBuiltIn",function()
	{
		it('should not throw',function()
		{
			expect(function()
			{
				builder.importBuiltIn();
			}).to.not.throw();
		});

		it('should import builtin factories',function()
		{
			for(let p of BUILT_IN_FACTORIES)
				expect( builder[p] ).to.exist;
		});
	});	

	describe("#custom",function()
	{
		it('the middlware should be inserted in the head',function()
		{
			builder.custom(sample_middleware);
			expect(typeof builder.middlewares[0]).to.be.equal("function");
			expect(builder.middlewares[0] === sample_middleware).to.be.equal(true);
		});

		it('head should move',function()
		{
			builder.custom(sample_middleware);
			expect(builder.head).to.be.equal(2);
			expect(typeof builder.middlewares[1]).to.be.equal("function");
			expect(builder.middlewares[1] === sample_middleware).to.be.equal(true);
		});

		it('should return this to enable chaining',function()
		{
			let a = builder.custom(sample_middleware);
			expect(a).to.be.equal(builder);
		})

		after(function()
		{
			builder.middlewares = [];
			builder.head = 0;
		});
	});
	
	describe("#pointHead",function()
	{
		before(function()
		{
			let a = ()=>{};
			let b = ()=>{};
			let c = ()=>{};
			let d = ()=>{};
			let e = ()=>{};
			builder.middlewares = [a,b,c,d,e];
		});

		it('should move head into an index',function()
		{
			builder.pointHead(2);
			expect(builder.head).to.be.equal(2);
		})

		it('should throw when index is greater than or equal length',function()
		{
			expect(function()
			{
				builder.pointHead(5);
			}).to.throw("Head index out of range");

			expect(builder.head).to.be.equal(2);
		})

		it('should throw when index is less than 0',function()
		{
			expect(function()
			{
				builder.pointHead(-1);
			}).to.throw("Head index out of range");

			expect(builder.head).to.be.equal(2);
		});

		after(function()
		{
			builder.middlewares = [];
			builder.head = 0;
		});
	});
	
	describe("#lookHead",function()
	{
		let a = ()=>{};
		let b = ()=>{};
		let c = ()=>{};
		let d = ()=>{};
		let e = ()=>{};
		before(function()
		{
			builder.middlewares = [a,b,c,d,e];
		});

		after(function()
		{
			builder.middlewares = [];
			builder.head = 0;
		});

		it('should return the middleware',function()
		{
			builder.pointHead(2);
			expect(builder.lookHead()).to.be.equal(c);
		})

	});

	describe("#prevHead",function()
	{
		before(function()
		{
			let a = ()=>{};
			let b = ()=>{};
			let c = ()=>{};
			let d = ()=>{};
			let e = ()=>{};
			builder.middlewares = [a,b,c,d,e];
		});

		it('should move the head index',function()
		{
			builder.pointHead(4);
			builder.prevHead();
			expect(builder.head).to.be.equal(3);
		})

		it('should throw when index is less than 0',function()
		{
			expect(function()
			{
				builder.prevHead();
				builder.prevHead();
				builder.prevHead();
				builder.prevHead();
			}).to.throw("Head index out of range");

			expect(builder.head).to.be.equal(0);
		})

		after(function()
		{
			builder.middlewares = [];
			builder.head = 0;
		});
	});

	describe("#nexHead",function()
	{
		before(function()
		{
			let a = ()=>{};
			let b = ()=>{};
			let c = ()=>{};
			let d = ()=>{};
			let e = ()=>{};
			builder.middlewares = [a,b,c,d,e];
		});

		it('should move the head index',function()
		{
			builder.nextHead();
			expect(builder.head).to.be.equal(1);
		})

		it('should throw when index is greater than or equal length',function()
		{
			expect(function()
			{
				builder.nextHead();
				builder.nextHead();
				builder.nextHead();
				builder.nextHead();
			}).to.throw("Head index out of range");

			expect(builder.head).to.be.equal(4);
		})

		after(function()
		{
			builder.middlewares = [];
			builder.head = 0;
		});
	});

	describe("#pre",function()
	{
		todo();
	});

	describe("#post",function()
	{
		todo();
	});

	describe("#expose",function()
	{
		before(function()
		{
			let a = ()=>{};
			let b = ()=>{};
			let c = ()=>{};
			let d = ()=>{};
			let e = ()=>{};
			builder.middlewares = [a,b,c,d,e];
		});

		it('should return the middlewares',function()
		{
			let mws = builder.expose();
			expect(mws).to.equal(builder.middlewares);
		})

		after(function()
		{
			builder.middlewares = [];
			builder.head = 0;
		});
	});
});