import { TentDome, Tent } from "../../../index";
import { Model } from "../../../components/model"
import { Sanitation } from "../../../components/plugins/sanitation";

import chai =require("chai");
var chaiHttp = require("chai-http");

import {config} from "dotenv";
config();

let {assert, expect,use } = chai;
use(chaiHttp);


describe("Sanitation Plugin - Integration",function()
{
	//schema
	interface SampleSchema
	{
		name : string,
		readOnly : string,
		writeOnly : string
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
			entity = Tent.Entity<SampleSchema>("Book",
			{
				name   : String,
				readOnly : { type: String, default: "unwritable" },
				writeOnly : String
			},
			{
				toObject : { virtuals: true },
				toJSON : { virtuals: true },
				id : false
			});

			//expose routes
			//inbound
			entity.Routes.create();
			entity.Routes.update();
			
			//outbound
			entity.Routes.read();
			entity.Routes.list();
			
			entity.Routes.delete();

			entity.install(new Sanitation<SampleSchema>());

			let sanitation : Sanitation<SampleSchema> = entity.plugins.sanitation as Sanitation<SampleSchema>;
			

			sanitation.inbound.blacklist( ["readOnly"] );
			sanitation.outbound.blacklist( ["writeOnly"] );


			entity.register();

			entity.Schema.model.deleteMany({}).exec();

			console.log(entity.Routes.builder("/","GET").expose());
		}).to.not.throw();
		
	});


	let _id : string = "";
	describe("#inbound",()=>
	{
		it('should block readonly request',function(done){
			chai.request(Tent.app())
				.post("/api/books")
				.send({
					name   : "inboundBook",
					readOnly : "attempted",
					writeOnly : "modified"

				})
				.then(async(res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						let a = (await entity.Schema.model.find({}).exec())[0];
						expect(a.readOnly).to.be.equal("unwritable");
						_id = a._id.toString();
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

	describe("#outbound",()=>
	{
		it('should block writeonly GET requests',function(done){
			chai.request(Tent.app())
			.get("/api/books/"+_id)
			.then((res)=>
			{
				try
				{
					expect(res).to.have.status(200);
					expect(res.body.readOnly).to.be.equal("unwritable");
					expect(res.body.writeOnly).to.not.exist;
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done)
		});
		it('should block writeonly LIST requests',function(done){
			chai.request(Tent.app())
			.get("/api/books/")
			.then((res)=>
			{
				try
				{
					expect(res).to.have.status(200);
					expect(res.body[0].readOnly).to.be.equal("unwritable");
					expect(res.body[0].writeOnly).to.not.exist;
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
	


	it("should start properly",function(done)
	{
		Tent.register();
		Tent.start(3022).then(()=>
		{
			done();
		})
		.catch(done)
	});


	after(function()
	{

		Tent.AppServer.close();		
	});
});