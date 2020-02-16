import { Accessor, Dispatcher, Document } from "../../../components/routes/accessor";
import { Model , get } from "../../../components/model";

import { assert, expect, use } from "chai";
import { todo } from "../../util";

import { spy } from "sinon";
import { createRequest, createResponse } from "node-mocks-http";

import chaiAsPromised = require("chai-as-promised");
import mongoose = require("mongoose");
use(chaiAsPromised);

//precondition
import "./params.spec";


describe("Accessor",function()
{
	let req = createRequest();
	let res = createResponse();

	interface SampleSchema
	{
		name ?: string,
		age  ?: number,
		date ?: Date,
		layer?: 
		{
			sublayer: number
		},
		not_field?: number,
		bubble ?: any,
		is_recent?: boolean
	}

	let accessor 	: Accessor<SampleSchema>;
	let dispatcher  ;
	let  bubble : Model<any> ;

	before(function(done)
	{
		let model : Model<SampleSchema> = {} as Model<SampleSchema>;
		model = new Model<SampleSchema>("Person");
		model.define({
			name : String,
			age  : Number,
			date : {  type: Date, default : Date.now },
			layer :
			{
				sublayer: Number
			},
			is_recent: Boolean,
			bubble : { type: mongoose.Schema.Types.ObjectId, ref: "Bubble"}
		});

		bubble = new Model<any>("Bubble");
		bubble.define({
			name : String
		});

		model.Expand.add("bubble","name _id");
		model.Schema.method("sayHello",function()
		{
			return { value : "Hello"};
		})
		model.Schema.static("sayHello",function()
		{
			return { value : "Hello Static"};
		})

		model.register();
		bubble.register();

		process.nextTick(function()
		{
			mongoose.connection.dropDatabase(done);
		});
	});


	describe("#constructor",function()
	{
		it('should not throw error',function()
		{
			expect(function()
			{
				accessor = new Accessor<any>(req,res);
			}).to.not.throw();
		});

		it('should have a scope `plugins` for plugins',function()
		{
			expect(accessor.plugins).to.exist;
		})
	});

	describe("#Model",function()
	{

		it('should not throw any error',function()
		{
			expect(function()
			{
				accessor.Model("Person");
			}).to.not.throw();
		});

		it('should attach the indicated model', function()
		{
			expect(accessor.model).to.be.equal(get("Person"));
		});

		it('should attach the indicated collection', function()
		{
			expect(accessor.collection).to.be.equal(get("Person").Schema.model);
		});
	});

	describe("#Static",function()
	{
		before(function()
		{
			accessor.collection = undefined;
			accessor.model = undefined;
		});

		it("should throw when Model is not yet called",function(done)
		{
			accessor.Static("sayHello").then(function()
			{
				done(new Error("Should throw"));
			})
			.catch((err)=>
			{
				if(err.name == "AssertionError")
					done()
				else
					done(err);
			})
		});

		it("should throw when Method does not exist",function(done)
		{
			accessor.Model("Person");
			accessor.Static("NonExistent").then(function()
			{
				done(new Error("Should throw"));
			})
			.catch((err)=>
			{
				if(err.name == "AssertionError")
					done()
				else
					done(err);
			})
		});

		it("should save the result of the method in `accessor.returnVal`",function(done)
		{
			accessor.Static("sayHello").then(function()
			{
				try
				{
					expect(accessor.returnVal).to.be.deep.equal({ value : "Hello Static"});
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done)
		});
	});

	describe("#Sanitize",function()
	{
		before(function()
		{
			accessor.collection = undefined;
		});
		beforeEach(function()
		{
			//reset payload
			accessor.payload = {};

		});

		it("should throw when model is not yet called",function()
		{
			expect(function()
			{
				accessor.Sanitize({})
			})
			.to.throw().property("name","AssertionError");
		})

		it("should be able to work on basic body",function()
		{
			accessor.Model("Person");
			accessor.Sanitize({
				name : "sample",
				age  : 12
			});

			expect(accessor.payload).to.be.eql({
				name : "sample",
				age  : 12
			});
		});

		it("should be able to flatten body",function()
		{
			accessor.Sanitize({
				name : "sample",
				age  : 12,
				layer:
				{
					sublayer: 2
				}
			});

			expect(accessor.payload).to.be.eql({
				name : "sample",
				age  : 12,
				"layer.sublayer": 2
			});
		});

		it("should be able to block undefined fields",function()
		{
			accessor.Sanitize({ not_field: 23, age: 12, name: "sample" });
			expect(accessor.payload).to.be.eql(
			{
				age: 12,
				name : "sample"
			});
		});
	});

	describe("#FreshDocument",function()
	{
		before(function()
		{
			accessor.model = undefined;
			accessor.collection = undefined;
		});

		it('should throw if model is not yet called',function()
		{
			expect(function()
			{
				accessor.FreshDocument();
			}).to.throw().property("name","AssertionError");
		});

		it('should not throw', function()
		{
			accessor.document = undefined;
			accessor.Model("Person");

			
			expect(function()
			{
				accessor.FreshDocument();
			}).to.not.throw()

		});

		it('should work properly', function()
		{
			expect(accessor.document).to.be.an.instanceof(get("Person").Schema.model);
		});

		it('should be new',function()
		{
			expect(accessor.document.isNew).to.be.equal(true);
		});

		it('should not be modified',function()
		{
			expect(accessor.document.isModified()).to.be.not.ok;
		});

	});

	describe("#Read",function()
	{
		let _id : string = "";
		before(async function()
		{
			accessor.model = undefined;
			accessor.collection = undefined;

			//add new Person
			let Person : any = get("Person").Schema.model;
			let person : any = new Person();
			
			person.name = "Sample Person";
			person.age  = 18;

			await person.save();

			_id = person._id.toString();
		});

		it('should throw AssertionError if model is not yet called',function(done)
		{
			accessor.Read(_id)
			.then(()=>
			{
				done(new Error("Does not throw."));
			})
			.catch((err)=>
			{
				if(err.name=="AssertionError")
					done();
				else
					done(err);
			});
		});

		it('should throw if model is nonexistent',function(done)
		{
			accessor.Model("Person");
			accessor.Read("nonexistent id")
			.then(()=>
			{
				done(new Error("Does not throw."));
			})
			.catch((err)=>
			{
				if(err.name=="AssertionError" || err.name =="CastError")
					done();
				else
					done(err);
			});
		});

		it('should not throw', function(done)
		{
			accessor.document = undefined;
			accessor.Model("Person");

			accessor.Read(_id)
			.then(()=>
			{
				done();
			})
			.catch((err)=>
			{
				done(err);
			});

		});

		it('should work properly', async function()
		{
			await accessor.Read(_id);
			expect(accessor.document).to.be.an.instanceof(get("Person").Schema.model);
		});

		it('should not be new',function()
		{
			expect(accessor.document.isNew).to.be.not.ok;
		});

		it('should not be modified',function()
		{
			expect(accessor.document.isModified()).to.be.not.ok;
		});

	});

	describe("#Assign",function()
	{
		before(function()
		{
			accessor.payload = undefined;
			accessor.document = undefined;
		});

		it("should throw error if #Sanitize is not yet called",function()
		{
			expect(function()
			{
				accessor.Assign();
			}).to.throw("Assign can not be called without first calling Sanitize");
		});	

		it("should throw error if #Read or #FreshDocument is not yet called",function()
		{
			accessor.Sanitize({ name: "Sample", age: 18, is_recent: false });
			expect(function()
			{
				accessor.Assign();
			}).to.throw("Assign can not be called without first calling Read or FreshDocument");
		});	

		it("should not throw error",function()
		{
			accessor.FreshDocument();
			expect(function()
			{
				accessor.Assign();
			}).to.not.throw();
		});	

		it("should assign value properly",function()
		{
			const keys = ["name","age","is_recent"];
			for(let i of keys) {
				expect(accessor.document.get(i)).to.be.equal(accessor.payload[i]);
			}
		});
	});

	describe("#Method",function()
	{
		before(function()
		{
			accessor.collection = undefined;
			accessor.model = undefined;
		});

		it("should throw when Model is not yet called",function(done)
		{
			accessor.Method("sayHello")
			.then(()=>
			{
				done(new Error("Should throw"));
			})
			.catch((err)=>
			{
				if(err.name == "AssertionError")
					done();
				else
					done(err);
			});
		});

		it("should throw when #Read or #FreshDocument is not yet called",function(done)
		{
			accessor.Model("Person");
			accessor.Method("nonExistentMethod")
			.then(()=>
			{
				done(new Error("Should throw"));
			})
			.catch((err)=>
			{
				if(err.name == "AssertionError")
					done();
				else
					done(err);
			});
		});

		it("should throw when Method does not exist",function(done)
		{
			accessor.Model("Person");
			accessor.FreshDocument();
			accessor.Method("nonExistentMethod")
			.then(()=>
			{
				done(new Error("Should throw"));
			})
			.catch((err)=>
			{
				if(err.name == "AssertionError")
					done();
				else
					done(err);
			});
		});

		it("should save the result of the method in `accessor.returnVal`",function(done)
		{
			accessor.Method("sayHello").then(function()
			{
				try
				{
					expect(accessor.returnVal).to.be.deep.equal({ value : "Hello"});
					done();
				}
				catch(err)
				{
					done(err)
				}

			}).catch(done);
		});
	});


	describe("#Param",function()
	{
		before(function()
		{
			// name : String,
			// age  : Number,
			// date : {  type: Date, default : Date.now },
			// layer :
			// {
			// 	sublayer: Number
			// }
		});

		it("should parse params properly",function()
		{
			accessor.Param({
				name  : "a",
				age  : "12..15",
				"layer.sublayer": "2",
				"unicorns": "12",
				sort  : "-name",
				limit : "1",
				offset: "12",
				expand: "bubble,buttercup,blossom",
				option: "true",
			});
			// accessor.Param("name=a&age=12..15&sort=-name&limit=1&offset=12&expand=bubble");
			expect(accessor.param).to.be.deep.equal({ 
				sort: { name: -1 },
				pagination: { limit: 1, offset: 12 },
				filters: { name : "a" , age : { $gte: "12", $lte: "15" }, "layer.sublayer" : 2 },
				populate : ["bubble"],
				options: true
			});
		});
	});


	describe("#List",function()
	{
		before(async function()
		{
			accessor.param = undefined;

			let Bubble = (bubble as Model<any>).Schema.model;
			let bubbleDoc = new Bubble();
			bubbleDoc.name = "HELLO";
			await bubbleDoc.save();

			//create test documents
			const docs : SampleSchema[] = 
			[
				{
					name: "Person 1",
					age : 2,
					date: new Date()
				},
				{
					name: "Person 2",
					age : 20,
					date: new Date()
				},
				{
					name: "Person 3",
					age : 100,
					date: new Date(),
					bubble : bubbleDoc._id
				},
			];

			await accessor.collection.deleteMany({});
			await accessor.collection.insertMany(docs);
		});

		after(async function()
		{
			await accessor.collection.deleteMany({});
		});

		it('should throw error if #Params is no yet called',function()
		{
			expect(accessor.List()).to.be.rejectedWith();
		});	
		it('should throw no error',function()
		{
			accessor.Param({});
			expect(accessor.List()).to.be.eventually.not.ok;
		});

		it('should work properly on basic query',async function()
		{
			accessor.Param({});
			await accessor.List();

			expect(accessor.list).to.exist;
			expect(accessor.list.length).to.be.equal(3);
		});
		
		it('should work properly sort query',async function()
		{
			accessor.Param({sort: "-age"});
			await accessor.List();

			expect(accessor.list).to.exist;
			expect(accessor.list.length).to.be.equal(3);
			expect(accessor.list[0].age).to.be.equal(100);
			expect(accessor.list[2].age).to.be.equal(2);
		});

		it('should work properly pagination query',async function()
		{
			accessor.Param({ limit: "1" , offset: "1" });
			await accessor.List();

			expect(accessor.list).to.exist;
			expect(accessor.list.length).to.be.equal(1);
			expect(accessor.list[0].age).to.be.equal(20);
		});

		it('should work properly on filter query',async function()
		{
			accessor.Param({ age: "20" });
			await accessor.List();

			expect(accessor.list).to.exist;
			expect(accessor.list.length).to.be.equal(1);
			expect(accessor.list[0].age).to.be.equal(20);
		});

		it('should work properly on expand',function(done)
		{
			accessor.Param({ expand: "bubble" });
			accessor.List().then(()=>
			{
				try
				{
					expect(accessor.list).to.exist;
					expect(accessor.list.length).to.be.equal(3);
					expect(accessor.list[2].age).to.be.equal(100);
					expect((accessor.list[2].bubble as any).name).to.be.equal("HELLO");
					done();
				}
				catch(err)
				{
					done(err)
				}
			})
			.catch(done);

		});
	});

	describe("#Save",function()
	{
		before(function()
		{
			accessor.document = undefined;
		});

		it('should throw AssertionError when document is not yet defined',function(done)
		{
			accessor.Save()
			.then(()=>
			{
				done(new Error("Should throw"));
			})
			.catch((err)=>
			{
				if(err.name=="AssertionError")
					done();
				else
					done(err);
			});
		});

		it('should not throw when document is defined',function(done)
		{
			accessor.FreshDocument();
			accessor.Save().then(()=>
			{
				done();
			}).catch((err)=>
			{
				done(err);
			});
		});

		it('should save the document in the database.',async function()
		{
			accessor.FreshDocument();
			accessor.document.name = "Sample test";
			accessor.document.age  =  20;
			await accessor.Save();

			let  docs : Document<SampleSchema>[] = (await accessor.collection.find({ name : "Sample test" }).exec());
			expect(docs.length).to.be.gte(1);
			let doc : Document<SampleSchema>  = docs[0];
			expect(doc.age).to.be.equal(20);
		});
	});

	describe("#Delete",function()
	{
		let _id : string = "";
		const SAMPLE_NAME = "Sample Person to be Deleted";

		beforeEach(async function()
		{
			accessor.model = undefined;
			accessor.collection = undefined;
			accessor.document = undefined;
			accessor.Model("Person");

			//add new Person
			let Person = get("Person").Schema.model;
			let person : Document<SampleSchema> = new Person();
			
			person.name = SAMPLE_NAME;
			person.age  = 99;

			await person.save();

			_id = person._id.toString();
		});

		afterEach(async function()
		{
			let Person = get("Person").Schema.model;
			let person : Document<SampleSchema>= (await Person.find({ _id: _id }).exec())[0];

			if(person)
				await person.remove();
		});


		it('should throw AssertionError when document is not yet defined',function(done)
		{
			accessor.Delete()
			.then(()=>
			{
				done(new Error("Should throw."));
			})
			.catch((err)=>
			{
				if(err.name=="AssertionError")
					done();
				else
					done(err);
			});
		});
		
		it('should throw when document defined is new',function(done)
		{
			accessor.FreshDocument();
			accessor.Delete().then(()=>
			{
				done(new Error("Should throw"));
			})
			.catch((err)=>
			{
				if(err.name=="AssertionError")
					done();
				else
					done(err);
			});
		});

		it('should not throw when old document is defined',function(done)
		{
			accessor.Read(_id)
			.then(()=>
			{
				accessor.Delete()
				.then(()=>
				{
					done();
				})
				.catch((err)=>
				{
					done(err);
				});
			})
			.catch((err)=>
			{
				done(err);
			});
		});

		it('should delete data in the database',function(done)
		{
			accessor.Read(_id)
			.then(()=>
			{
				accessor.Delete()
				.then(async()=>
				{
					try
					{
						let Person = get("Person").Schema.model;
						let persons = await Person.find({ _id: _id }).exec();
						expect(persons.length).to.be.equal(0);
						done();
					}
					catch(e)
					{
						done(e);
					}
				})
				.catch((err)=>
				{
					done(err);
				});
			})
			.catch((err)=>
			{
				done(err);
			});
		});
	});
	describe("#Present",function()
	{
		before(function(done)
		{
			//create test documents
			const docs : SampleSchema[] = 
			[
				{
					name: "Person 1",
					age : 2,
					date: new Date()
				},
				{
					name: "Person 2",
					age : 20,
					date: new Date()
				},
				{
					name: "Person 3",
					age : 100,
					date: new Date()
				},
			];

			accessor.list = undefined;
			accessor.Model("Person");
			accessor.Param({});
			accessor.collection.insertMany(docs,done);
		});

		after(async function()
		{
			await accessor.collection.deleteMany({});
		});

		it('should throw when list is not yet called',function()
		{
			expect(function()
			{
				accessor.Present();
			}).to.throw().property("name","AssertionError");
		})

		it('should not throw when list is called',function(done)
		{
			accessor.Model("Person");	
			accessor.Param({});
			accessor.List().then(()=>
			{
				try
				{
					accessor.Present();
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch((err)=>
			{
				done(err);
			});

		});

		it('should return the list',function(done)
		{
			accessor.List().then(async()=>
			{
				try
				{
					let list 	 : any[] = accessor.Present() as any[];
					let trueList : any[] = await accessor.collection.find({}).exec();

					expect(list).to.exist;
					expect(list.length).to.be.equal( trueList.length );
					expect(list.map(x=>x.toObject())).to.be.deep.equal( trueList.map(x=>x.toObject()) );
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch((err)=>
			{
				done(err);
			});
		});

	});

	describe("#Show",function()
	{
		let _id : string = "";
		beforeEach(async function()
		{
			accessor.model = undefined;
			accessor.collection = undefined;
			accessor.document = undefined;

			//add new Person
			let Person = get("Person").Schema.model;
			let person: Document<SampleSchema> = new Person();
			
			person.name = "Sample Person";
			person.age  = 18;

			await person.save();

			_id = person._id.toString()
			;
			accessor.Model("Person");
			accessor.Param({});
		});

		afterEach(async function()
		{
			await accessor.collection.deleteMany({});
		});


		it('should throw when #Read is not yet called.',function()
		{
			expect(function()
			{
				accessor.Show();
			}).to.throw().property("name","AssertionError");
		});

		it('should throw when document is fresh.',function()
		{
			accessor.FreshDocument();
			expect(function()
			{
				accessor.Show()
			}).to.throw().property("name","AssertionError");
		});

		it('should not throw when #Read is defined.',function(done)
		{
			accessor.Read(_id)
			.then(()=>
			{
				expect(function()
				{
					accessor.Show();
				}).to.not.throw();
				done();
			})
			.catch((err)=>
			{
				done(err);
			});
		});

		it('should properly return the document.',function(done)
		{
			accessor.Read(_id)
			.then(()=>
			{
				let a = accessor.Show();
				expect(a).to.be.equal(accessor.document);
				done();
			})
			.catch((err)=>
			{
				done(err);
			});
		});

	});

	describe("#Return",function()
	{
		before(function()
		{
			accessor.returnVal = undefined;
		});

		it('should throw when `Method` or `Static` is not yet called',function()
		{
			expect(function()
			{
				accessor.Return();
			}).to.throw().property("name","AssertionError");
		});
		it('should work',async function()
		{
			await accessor.Method("sayHello");
			expect(accessor.Return()).be.deep.equal({ value:"Hello" });
		});
	})
});

describe("Dispatcher",function()
{
	let req = createRequest();
	let res = createResponse();
	let dispatcher : Dispatcher;

	describe("#constructor",function()
	{
		beforeEach(function()
		{
			if(dispatcher)
			{
				dispatcher.req = undefined;
				dispatcher.res = undefined;
			}
		});

		it('should not throw',function()
		{
			expect(function()
			{
				dispatcher = new Dispatcher(req,res);
			}).to.not.throw();
		});

		it('should assign req and res.',function()
		{
			expect(function()
			{
				dispatcher = new Dispatcher(req,res);
				expect(dispatcher.req).to.be.equal(req);
				expect(dispatcher.res).to.be.equal(res);
			});
		});
	});

	describe("#apiError",function()
	{
		before(function()
		{
			dispatcher = new Dispatcher(req,res);
		});

		it('should send status code and message',function()
		{
			dispatcher.apiError( 404 , "Sample error" );
			expect(res._getStatusCode()).to.be.equal(404);
			expect(res._getData().error).to.be.equal("Sample error");
		});
		it('should send 500 with error',function()
		{
			dispatcher.apiError( new Error("Sample error") );
			expect(res._getStatusCode()).to.be.equal(500);
			expect(res._getData().error).to.be.equal("Sample error");
		});
	});
});