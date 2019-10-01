import { Middlewares } from "../../../components/routes/middlewares";

import { Accessor , Dispatcher, Document } from "../../../components/routes/accessor";
import { createRequest, createResponse } from "node-mocks-http";
import { Model , get } from "../../../components/model";

import { assert, expect, use, request } from "chai";
import { todo, promisify } from "../../util";

import chaiHTTP = require("chai-http");
import express = require("express");
import mongoose = require("mongoose");


use(chaiHTTP);


//precondition
import "./accessor.spec"


describe("Middlewares",function()
{
	let app;
	let req : any, res: any;

	interface SampleSchema
	{
		name : string,
		age  : number,
		date : Date,
		bubble? : any
	}



	before(function(done)
	{
		req = createRequest();
		res = createResponse();
		
		process.nextTick(function()
		{
			mongoose.connection.dropDatabase(done);
		});
	});

	beforeEach(function()
	{
		app = express();
	});

	describe("#initTent",function()
	{
		it('should assign accessor and dispatcher',function(done)
		{
			Middlewares.initTent(req,res,function(err : Error)
			{
				if(err) return done(err);

				expect(req.tent).to.be.an.instanceof(Accessor);
				expect(res.tent).to.be.an.instanceof(Dispatcher);
				done();
			});
		});
	});

	describe("#model",function()
	{
		it('should assign a model',function(done)
		{
			Middlewares.model("Person")(req,res,function(err : Error)
			{
				if(err) return done(err);

				expect(req.tent.model).to.be.equal(get("Person"));
				expect(req.tent.collection).to.be.equal(get("Person").Schema.model);
				done();
			});
		});
	});

	describe("#create",function()
	{
		before(function()
		{
			req.tent.model = undefined;
			req.tent.collection = undefined;
		});

		it('should throw if model is not yet called',function(done)
		{
			promisify(Middlewares.create(),req,res).then(()=>
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

		it('should not throw', function(done)
		{
			promisify(Middlewares.model("Person"),req,res)
			.then(()=>
			{
				promisify(Middlewares.create(),req,res)
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

		it('should work properly', function()
		{
			expect(req.tent.document).to.be.an.instanceof(get("Person").Schema.model);
		});

		it('should be new',function()
		{
			expect(req.tent.document.isNew).to.be.equal(true);
		});

		it('should not be modified',function()
		{
			expect(req.tent.document.modified).to.be.not.ok;
		});
	});

	describe("#read",function()
	{
		let _id : string = "";
		before(async function()
		{
			req.tent.model = undefined;
			req.tent.collection = undefined;

			//add new Person
			let Person = get("Person").Schema.model;
			let person : Document<SampleSchema> = new Person();
			
			person.name = "Sample Person";
			person.age  = 18;

			await person.save();

			_id = person._id.toString();
		});

		it('should throw AssertionError if model is not yet called',function(done)
		{
			promisify(Middlewares.read(),req,res)
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

		it('should throw if document param id is nonexistent',function(done)
		{
			promisify(Middlewares.model("Person"),req,res)
			.then(()=>
			{
				promisify(Middlewares.read(),req,res)
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
			})
			.catch((err)=>
			{
				done(err);
			})
		});

		it('should return 404 `Document not found` if document id is nonexistent',function(done)
		{
			req.params.id = "nonexistent document";
			promisify(Middlewares.model("Person"),req,res)
			.then(()=>
			{
				promisify(Middlewares.read(),req,res)
				.then(()=>
				{
					try
					{
						expect(res._getStatusCode()).to.be.equal(404);
						expect(res._getData().error).to.be.equal("Document not found");
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
			})
			.catch((err)=>
			{
				done(err);
			})
		});

		it('should work properly', function(done)
		{
			req.params.id = _id;
			promisify(Middlewares.model("Person"),req,res)
			.then(()=>
			{
				promisify(Middlewares.read(),req,res)
				.then(()=>
				{
					try
					{
						expect(req.tent.document).to.exist;
						expect(req.tent.document.name).to.be.equal("Sample Person");
						expect(req.tent.document.age).to.be.equal(18);
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
			})
			.catch((err)=>
			{
				done(err);
			});
		});

		it('should not be new',function()
		{
			expect(req.tent.document.isNew).to.be.not.ok;
		});

		it('should not be modified',function()
		{
			expect(req.tent.document.modified).to.be.not.ok;
		});
	});

	describe("#sanitize",function()
	{
		beforeEach(function()
		{
			//reset payload
			req.tent.payload = {};

		});

		it("should be able to work on basic body",function(done)
		{
			req.body = 
			{
				name : "sample",
				age  : 12
			};
			promisify(Middlewares.sanitize(),req,res)
			.then(()=>
			{
				try
				{
					expect(req.tent.payload).to.be.eql({
						name : "sample",
						age  : 12
					});
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

		it("should be able to flatten body",function(done)
		{
			req.body = 
			{
				name : "sample",
				age  : 12,
				layer:
				{
					sublayer: 2
				}
			};
			
			promisify(Middlewares.sanitize(),req,res)
			.then(()=>
			{
				try
				{
					expect(req.tent.payload).to.be.eql({
						name : "sample",
						age  : 12,
						"layer.sublayer": 2
					});
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

	describe("#assign",function()
	{
		before(function()
		{
			req.tent.payload = undefined;
			req.body = { name: "Sample", age: 18 };
		});

		it("should throw error if #Read or #FreshDocument is not yet called",function(done)
		{
			req.tent.document = undefined; 
			promisify(Middlewares.assign(),req,res)
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

		it("should throw error if #sanitize is not yet called",function(done)
		{
			req.tent.document = undefined;
			req.tent.payload  = undefined; 
			promisify(Middlewares.create(),req,res)
			.then(()=>
			{
				promisify(Middlewares.assign(),req,res)
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
			})
			.catch((err)=>
			{
				done(err);
			});
		});	

		it("should assign value properly",function(done)
		{
			promisify(Middlewares.create(),req,res)
			.then(()=>
			{
				promisify(Middlewares.sanitize(),req,res)
				.then(()=>
				{
					promisify(Middlewares.assign(),req,res)
					.then(()=>
					{
						try
						{
							const keys = ["name","age"];
							for(let i of keys)
								expect(req.tent.document.get(i)).to.be.equal(req.tent.payload[i]);
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


	describe("#method", function()
	{
		before(function()
		{
			req.tent.model 		= undefined;
			req.tent.collection = undefined;
			req.tent.document   = undefined;
		});

		it('should throw if model is not yet called',function(done)
		{
			promisify(Middlewares.method("sayHello"),req,res).then(()=>
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

		it('should throw if #FreshDocument or #Read is not yet called is not yet called',function(done)
		{;
			promisify(Middlewares.model("Person"),req,res).then(function()
			{
				promisify(Middlewares.method("sayHello"),req,res).then(()=>
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
			})
			.catch(done);
		});

		it('should throw if method is nonexistent',function(done)
		{
			promisify(Middlewares.model("Person"),req,res).then(()=>
			{
				promisify(Middlewares.create(),req,res).then(()=>
				{
					promisify(Middlewares.method("NonexistentMethod"),req,res).then(()=>
					{
						done(new Error("Should throw"));
					})
					.catch((err)=>
					{
						if(err.name=="AssertionError")
							done();
						else
							done(err);
				})
				.catch(done);
			})
			.catch(done);
			});
		});

		it('should work properly',function(done)
		{
			promisify(Middlewares.model("Person"),req,res).then(()=>
			{
				promisify(Middlewares.create(),req,res).then(()=>
				{
					promisify(Middlewares.method("sayHello"),req,res).then(()=>
					{
						try
						{
							expect( req.tent.returnVal ).to.be.deep.equal({ value : "Hello" });
							done();
						}
						catch(e)
						{
							done(e);
						}
					})
					.catch(done);
				}).catch(done);
			}).catch(done);
		});
	});
	describe("#static", function()
	{
		before(function()
		{
			req.tent.model 		= undefined;
			req.tent.collection = undefined;
			req.tent.returnVal  = undefined;
		});

		it('should throw if model is not yet called',function(done)
		{
			promisify(Middlewares.static("sayHello"),req,res).then(()=>
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

		it('should throw if static is nonexistent',function(done)
		{	
			promisify(Middlewares.model("Person"),req,res).then(()=>
			{
				promisify(Middlewares.static("NonexistentMethod"),req,res).then(()=>
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
			}).catch(done);
			
		});

		it('should work properly',function(done)
		{
			promisify(Middlewares.model("Person"),req,res).then(()=>
			{
				promisify(Middlewares.static("sayHello"),req,res).then(()=>
				{
					try
					{
						expect( req.tent.returnVal ).to.be.deep.equal({ value : "Hello Static"});
						done();
					}
					catch(e)
					{
						done(e);
					}
				})
				.catch(done);
			}).catch(done);
			
		});
	});

	describe("#save",function()
	{
		it('should throw AssertionError when document is not yet defined',function(done)
		{
			req.tent.document = undefined;

			promisify(Middlewares.save(),req,res)
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

		it('should not throw when document is defined',function(done)
		{
			promisify(Middlewares.create(),req,res)
			.then(()=>
			{
				promisify(Middlewares.save(),req,res).then(()=>
				{
					done();
				}).catch((err)=>
				{
					done(err);
				});
			})
			.catch((err)=>
			{
				done(err);
			});
		});

		it('should save the document in the database.',function(done)
		{
			req.body = {
				name : "Sample test",
				age  : 20
			};
			req.tent.document = undefined;
			promisify(Middlewares.create(),req,res)
			.then(()=>
			{
				promisify(Middlewares.sanitize(),req,res).then(()=>
				{
					promisify(Middlewares.assign(),req,res).then(()=>
					{
						promisify(Middlewares.save(),req,res).then(async()=>
						{
							try{
								let  doc = (await req.tent.collection.find({ name : "Sample test" }).exec());
								expect(doc.length).to.be.gte(1);
								doc = doc[0];
								expect(doc.age).to.be.equal(20);
								done();
							}
							catch(err)
							{
								done(err);
							}
						}).catch((err)=>
						{
							done(err);
						});
					}).catch((err)=>
					{
						done(err);
					});
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


	describe("#remove",function()
	{
		let _id : string = "";
		const SAMPLE_NAME = "Sample Person to be Deleted";

		beforeEach(async function()
		{
			req.tent.model = undefined;
			req.tent.collection = undefined;
			req.tent.document = undefined;
			req.tent.Model("Person");

			//add new Person
			let Person = get("Person").Schema.model;
			let person : Document<SampleSchema>= new Person();
			
			person.name = SAMPLE_NAME;
			person.age  = 99;

			await person.save();

			_id = person._id.toString();
		});

		afterEach(async function()
		{
			let Person = get("Person").Schema.model;
			let person = (await Person.find({ _id: _id }).exec())[0];

			if(person)
				await person.remove();
		});


		it('should throw AssertionError when document is not yet defined',function(done)
		{
			promisify(Middlewares.remove(),req,res)
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
			promisify(Middlewares.create(),req,res)
			.then(()=>
			{
				promisify(Middlewares.remove(),req,res)
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
			})
			.catch((err)=>
			{
				done(err);				
			});
		});

		it('should not throw when old document is defined',function(done)
		{
			req.params.id = _id;
			promisify(Middlewares.read(),req,res)
			.then(()=>
			{
				promisify(Middlewares.remove(),req,res)
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
			req.params.id = _id;
			promisify(Middlewares.read(),req,res)
			.then(()=>
			{
				promisify(Middlewares.remove(),req,res)
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

	describe("#param",function()
	{
		it("should parse params properly",function(done)
		{
			req.query = {
				name  : "a",
				age  : "12..15",
				sort  : "-name",
				limit : "1",
				offset: "12",
				expand: "bubble"
			};

			promisify(Middlewares.param(),req,res)
			.then(()=>
			{
				try
				{
					expect(req.tent.param).to.be.deep.equal({ 
						sort: { name: -1 },
						pagination: { limit: 1, offset: 12 },
						filters: { name : "a" , age : { $gte: "12", $lte: "15" } },
						populate : ["bubble"]
					});
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
			})
		});
	});

	describe("#list",function()
	{
		before(async function()
		{
			req.tent.param = undefined;

			let Bubble = (get("Bubble") as Model<any>).Schema.model;
			
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
					bubble: bubbleDoc._id
				},
			];


			await req.tent.collection.deleteMany({});
			await req.tent.collection.insertMany(docs);
			
		});

		after(async function()
		{
			await req.tent.collection.deleteMany({});
		});

		it('should throw error if #Params is no yet called',function(done)
		{
			promisify(Middlewares.list(),req,res)
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
			})
		});	
		it('should throw no error',function(done)
		{
			req.query = {};
			promisify(Middlewares.param(),req,res)
			.then(()=>
			{
				promisify(Middlewares.list(),req,res)
				.then(()=>
				{
					done();
				})
				.catch((err)=>
				{
					done(err);
				})

			})
			.catch((err)=>
			{
				done(err);
			})
		});

		it('should work properly on basic query',function(done)
		{
			req.query = {};
			promisify(Middlewares.param(),req,res)
			.then(()=>
			{
				promisify(Middlewares.list(),req,res)
				.then(()=>
				{
					try
					{
						expect(req.tent.list).to.exist;
						expect(req.tent.list.length).to.be.equal(3);
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
			})
			.catch((err)=>
			{
				done(err);
			});


		});
		
		it('should work properly sort query',function(done)
		{
			req.query = {sort: "-age"};

			promisify(Middlewares.param(),req,res)
			.then(()=>
			{
				promisify(Middlewares.list(),req,res)
				.then(async()=>
				{
					try{
						expect(req.tent.list).to.exist;
						expect(req.tent.list.length).to.be.equal(3);
						expect(req.tent.list[0].age).to.be.equal(100);
						expect(req.tent.list[2].age).to.be.equal(2);
						done();
					}catch(err)
					{
						done(err);
					}
				}).catch((err)=>{done(err);});
			}).catch((err)=>{done(err);})

		});

		it('should work properly pagination query',function(done)
		{
			req.query = { limit: "1" , offset: "1" };
			promisify(Middlewares.param(),req,res)
			.then(()=>
			{
				promisify(Middlewares.list(),req,res)
				.then(async()=>
				{
					try{
						expect(req.tent.list).to.exist;
						expect(req.tent.list.length).to.be.equal(1);
						expect(req.tent.list[0].age).to.be.equal(20);
						done();
					}catch(err)
					{
						done(err);
					}
				}).catch((err)=>{done(err);});
			}).catch((err)=>{done(err);})

		});

		it('should work properly on filter query',function(done)
		{
			req.query = { age: "20" };
			promisify(Middlewares.param(),req,res)
			.then(()=>
			{
				promisify(Middlewares.list(),req,res)
				.then(async()=>
				{
					try
					{
						expect(req.tent.list).to.exist;
						expect(req.tent.list.length).to.be.equal(1);
						expect(req.tent.list[0].age).to.be.equal(20);
						done();
					}catch(err)
					{
						done(err);
					}
				}).catch((err)=>{done(err);});
			}).catch((err)=>{done(err);})
		});


		it('should work properly on expand',function(done)
		{
			req.query = { expand: ["bubble"] };
			promisify(Middlewares.param(),req,res)
			.then(()=>
			{
				promisify(Middlewares.list(),req,res)
				.then(()=>
				{
					try
					{
						expect(req.tent.list).to.exist;
						expect(req.tent.list.length).to.be.equal(3);
						expect(req.tent.list[2].age).to.be.equal(100);
						expect((req.tent.list[2].bubble as any).name).to.be.equal("HELLO");
						done();
					}
					catch(err)
					{
						done(err)
					}
				}).catch((err)=>{done(err);});
			}).catch((err)=>{done(err);})
		});

		it('should work properly on expand - remove expand',function(done)
		{
			req.query = { expand: [] };
			promisify(Middlewares.param(),req,res)
			.then(()=>
			{
				promisify(Middlewares.list(),req,res)
				.then(()=>
				{
					try
					{
						expect(req.tent.list).to.exist;
						expect(req.tent.list.length).to.be.equal(3);
						expect(req.tent.list[2].age).to.be.equal(100);
						expect((req.tent.list[2].bubble as any).name).to.not.exist;
						done();
					}
					catch(err)
					{
						done(err)
					}
				}).catch((err)=>{done(err);});
			}).catch((err)=>{done(err);})
		});
	});

	describe("#success",function()
	{
		it('should respond 200',function(done)
		{
			promisify(Middlewares.success(),req,res)
			.then(()=>
			{
				try{
					expect(res._getStatusCode()).to.be.equal(200);
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done)
		});
		it('should respond `success`',function(done)
		{
			promisify(Middlewares.success(),req,res)
			.then(()=>
			{
				try{
					expect(res._getData()).to.be.deep.equal({ 
						message: "Success",
						code : 200
					});
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


	describe("#show",function()
	{
		let _id : string = "";
		beforeEach(async function()
		{
			req.tent.model = undefined;
			req.tent.collection = undefined;
			req.tent.document = undefined;

			//add new Person
			let Person = get("Person").Schema.model;
			let person : Document<SampleSchema> = new Person();
			
			person.name = "Sample Person";
			person.age  = 18;

			await person.save();

			_id = person._id.toString()
			;
			req.tent.Model("Person");
			req.tent.Param({});
		});

		afterEach(async function()
		{
			await req.tent.collection.deleteMany({});
		});


		it('should throw when #Read is not yet called.',function(done)
		{
			promisify(Middlewares.show(),req,res)
			.then(()=>
			{
				done(new Error("Should throw."));
			})
			.catch((err)=>{
				if(err.name == "AssertionError")
					done();
				else
					done(err);
			});
		});

		it('should throw when document is fresh.',function(done)
		{
			promisify(Middlewares.create(),req,res).then(()=>
			{
				promisify(Middlewares.show(),req,res).then(()=>
				{
					done(new Error("Should throw."));
				})
				.catch((err)=>
				{
					if(err.name == "AssertionError")
						done();
					else
						done(err);
				});
			})
			.catch((err)=>{done(err)})
		});

		it('should not throw when #Read is defined.',function(done)
		{
			req.params.id = _id;
			promisify(Middlewares.read(),req,res)
			.then(()=>
			{
				promisify(Middlewares.show(),req,res).then(()=>{done()})
				.catch((err)=>{done(err)});
			})
			.catch((err)=>{done(err)});
		});

		it('should properly return the document with status code of 200.',function(done)
		{
			req.params.id = _id;
			promisify(Middlewares.read(),req,res)
			.then(()=>
			{
				promisify(Middlewares.show(),req,res).then(()=>
				{
					expect(res._getStatusCode()).to.be.equal(200);
					expect(res._getData().toObject()).to.be.deep.equal(req.tent.document.toObject());
					done();
				})
				.catch((err)=>{done(err)});
			})
			.catch((err)=>{done(err)});
		});

	});


	describe("#present",function()
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

			req.tent.list = undefined;
			req.tent.Model("Person");
			req.tent.Param({});
			req.tent.collection.insertMany(docs,done);
		});

		after(async function()
		{
			await req.tent.collection.deleteMany({});
		});

		it('should throw when list is not yet called',function(done)
		{
			promisify(Middlewares.present(),req,res).then(()=>{done(new Error("Should throw"));})
			.catch((err)=>
			{
				if(err.name=="AssertionError")
					done()
				else
					done(err)
			});
		})

		it('should not throw when list is called',function(done)
		{
			req.tent.Model("Person");	
			req.tent.Param({});
			promisify(Middlewares.list(),req,res).then(()=>
			{
				promisify(Middlewares.present(),req,res).then(()=>
				{
					done();
				})
				.catch(done);
			})
			.catch(done);
		});

		it('should return the list',function(done)
		{
			req.tent.Model("Person");	
			req.tent.Param({});
			promisify(Middlewares.list(),req,res).then(()=>
			{
				promisify(Middlewares.present(),req,res).then(async()=>
				{
					try{
						let list 	 : any[] = res._getData();
						let trueList : any[] = await req.tent.collection.find({}).exec();

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
				.catch(done);
			})
			.catch(done);
		});

	});

	describe("#return",function()
	{
		let _id : string = "";
		before(async function()
		{
			req.tent.model = undefined;
			req.tent.collection = undefined;
			req.tent.returnVal  = undefined;

			//add new Person
			let Person = get("Person").Schema.model;
			let person : Document<SampleSchema> = new Person();
			
			person.name = "Sample Person";
			person.age  = 18;

			await person.save();
			_id = person._id.toString();


			await promisify(Middlewares.model("Person"),req,res);
		});
		
		it('should throw when `static` or `method` is not yet called',function(done)
		{
			promisify(Middlewares.return(),req,res)
			.then(()=>
			{
				done(new Error("Should throw."));
			})
			.catch((err)=>{
				if(err.name == "AssertionError")
					done();
				else
					done(err);
			});
		});


		it('should properly return the `returnVal` with status code of 200.',function(done)
		{
			req.params.id = _id;
			promisify(Middlewares.method("sayHello"),req,res)
			.then(()=>
			{
				promisify(Middlewares.return(),req,res).then(()=>
				{
					expect(res._getStatusCode()).to.be.equal(200);
					expect(res._getData()).to.be.deep.equal({ value : "Hello" });
					done();
				})
				.catch((err)=>{done(err)});
			})
			.catch((err)=>{done(err)});
		});

	});


});