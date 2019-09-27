import { TentDome } from "../index";
import { Model } from "../components/model"

import chai = require("chai");
let {assert, expect,use } = chai;
import chaiHttp = require("chai-http");
chai.use(chaiHttp);

import {config} from "dotenv";
config();


describe("Tent integration run 1.",function()
{
	var Tent = new TentDome();

	//schema
	interface SampleSchema
	{
		name 	?: string,
		number	?: number,
		list ?:
		{
			number : number,
			text   : string,
			date   : Date
		}[]
	}

	var entity : Model<SampleSchema>;

	it("should initialize properly",function()
	{
		expect(function()
		{
			Tent.init({
				"mongodb uri": process.env.TEST_MONGODB_URI
			});
		}).to.not.throw();
	});


	it("should create new entity",function()
	{
		expect(function()
		{
			entity = Tent.Entity<SampleSchema>("client",
			{
				name   : String,
				number : Number,
				list   :
				[{
					number: Number,
					text: String,
					date: { type: Date, default: Date.now }
				}]
			},
			{
				toObject : { virtuals: true },
				toJSON : { virtuals: true },
				id : false
			});

			entity.Schema.virtual<string>("virtual",{
				get: function()
				{
					return "Get " + this.name;
				},
				set: function(val)
				{
					this.name = "Set "+val;
				}
			});

			//expose routes
			entity.Routes.create();
			entity.Routes.update();
			entity.Routes.read();
			entity.Routes.list();
			entity.Routes.delete();

			entity.register();
		}).to.not.throw();
		
	});

	it("should start properly",function(done)
	{
		Tent.start().then(()=>
		{
			done();
		})
		.catch(done)
	});

	describe("CURLD Requests",function()
	{

		let _id : string;
		describe("LIST Request",function()
		{
			it("should return proper value",function(done)
			{
				chai.request(Tent.app())
				.get("/api/clients")
				.send()
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect(res.body).to.be.deep.equal([]);
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
			})
		});

		describe("CREATE Request",function()
		{
			it("should return proper value",function(done)
			{
				let sample_body = { name : "First Client", number: 20, list:[{number : 1,text : "Hello"}]};

				chai.request(Tent.app())
				.post("/api/clients")
				.send(sample_body)
				.then(async(res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect(res.body._id).to.exist;

						_id = res.body._id;
						delete res.body._id;
						delete res.body.__v;

						delete res.body.list[0]._id;
						expect(res.body.list[0].date).to.exist;
						delete res.body.list[0].date;


						expect(res.body).to.be.eql({
							...sample_body,
							virtual : "Get First Client"
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
			})
		});

		describe("READ Request",function()
		{
			it("should return proper value",function(done)
			{
				let sample_body = { _id : _id,name : "First Client", number: 20, list:[{number : 1,text : "Hello"}]};

				chai.request(Tent.app())
				.get("/api/clients/"+_id)
				.send()
				.then(async(res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect(res.body._id).to.exist;
						delete res.body.__v;
						delete res.body.list[0]._id;
						expect(res.body.list[0].date).to.exist;
						delete res.body.list[0].date;
						expect(res.body).to.be.eql( {
							...sample_body,
							virtual : "Get First Client"
						} );
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
			})
		});

		describe("UPDATE Request",function()
		{
			it("should return proper value",function(done)
			{
				let sample_body = { name : "First Client - edited" };

				chai.request(Tent.app())
				.put("/api/clients/"+_id)
				.send(sample_body)
				.then(async(res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect(res.body.name).to.be.eql( sample_body.name );
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
			})
		});

		describe("UPDATE Request with virtuals",function()
		{
			it("should return proper value",function(done)
			{
				let sample_body = { virtual : "Person" };

				chai.request(Tent.app())
				.put("/api/clients/"+_id)
				.send(sample_body)
				.then(async(res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect(res.body.name).to.be.equal( "Set Person" );
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
			})
		});

		describe("DELETE Request",function()
		{
			it("should return proper value",function(done)
			{
				let sample_body = { name : "First Client - edited" };

				chai.request(Tent.app())
				.delete("/api/clients/"+_id)
				.send()
				.then(async(res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect((await entity.Schema.model.find({}).exec()).length).to.be.equal(0);
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
			})
		});

		after(function(done)
		{
			entity.Schema.model.deleteMany({},done);
		});
	});


	after(function()
	{
		Tent.AppServer.close();		
	});


});