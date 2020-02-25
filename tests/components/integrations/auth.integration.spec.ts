import { TentDome, Tent } from "../../../index";
import { Model } from "../../../components/model"
import { AuthenticationPlugin } from "../../../components/plugins/authentication";

import chai = require("chai");
var chaiHttp = require("chai-http");

import {config} from "dotenv";
config();

let {assert, expect,use } = chai;
use(chaiHttp);


describe("Authentication Plugin - Integration",function()
{
	//schema
	interface SampleSchema
	{
		name 	?: string,
		email : string,
		password : string,
		active	 : boolean
	}

	var entity : Model<SampleSchema>;

	it("should initialize properly",function()
	{
		expect(function()
		{
			Tent.init({
				"mongodb uri": process.env.TEST_MONGODB_URI,
				"auth user"  : "UserAuth",
				"auth email token"    : "email",
				"auth password token" : "password",
				"auth secret" : "Shhhhh",
				"auth signup" : true,
				"auth activation token": "active"
			});

		}).to.not.throw();
	});

	it("should create new entity",function()
	{
		expect(function()
		{
			entity = Tent.Entity<SampleSchema>("UserAuth",
			{
				name   : String,
				email : String,
				password : String,
				active	 : Boolean
			},
			{
				toObject : { virtuals: true },
				toJSON : { virtuals: true },
				id : false
			});

			//expose routes
			entity.Routes.create();
			entity.Routes.update();
			entity.Routes.read();
			entity.Routes.list();
			entity.Routes.delete();

			entity.install(new AuthenticationPlugin());

			let auth : AuthenticationPlugin = entity.plugins.auth as AuthenticationPlugin;
			auth.allow("/","LIST");
			entity.register();
		}).to.not.throw();
		
	});
	


	it("should start properly",function(done)
	{
		Tent.register();
		Tent.start(3020).then(()=>
		{
			done();
		})
		.catch(done)
	});

	let token : string = "";
	describe("Signing up",function()
	{
		it("should deny malformed request",function(done)
		{
			chai.request(Tent.app())
			.post("/api/userauths/signup")
			.send({})
			.then((res)=>
			{
				try
				{
					expect(res).to.have.status(400);
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done)
		});

		it("should accept any kind of inputs by default",function(done)
		{
			chai.request(Tent.app())
			.post("/api/userauths/signup")
			.send({
				email 		: "johnyNotEmail",
				password	: "w"
			})
			.then((res)=>
			{
				try	{
					expect(res).to.have.status(200);
					done();
				}
				catch(err) {
					done(err);
				}
			})
			.catch(done)
		});

		it("should deny invalid inputs - wrong email regex format",function(done)
		{
			Tent.set("auth validation options", {
				emailPattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			});

			chai.request(Tent.app())
			.post("/api/userauths/signup")
			.send({
				email 		: "johnyNotEmail",
				password	: "w"
			})
			.then((res)=>
			{
				try
				{
					expect(res).to.have.status(400);
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done)
		});

		it("should deny invalid inputs - wrong email minimum length",function(done)
		{
			Tent.set("auth validation options", {
				emailMin: 10000
			});

			chai.request(Tent.app())
			.post("/api/userauths/signup")
			.send({
				email 		: "johnyNotEmail",
				password	: "w"
			})
			.then((res)=>
			{
				try
				{
					expect(res).to.have.status(400);
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done)
		});

		it("should deny invalid inputs - wrong email maximum length",function(done)
		{
			Tent.set("auth validation options", {
				emailMax: 2
			});

			chai.request(Tent.app())
			.post("/api/userauths/signup")
			.send({
				email 		: "johnyNotEmail",
				password	: "w"
			})
			.then((res)=>
			{
				try
				{
					expect(res).to.have.status(400);
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done)
		});

		it("should deny invalid inputs - wrong password regex format",function(done)
		{
			Tent.set("auth validation options", {
				passwordPattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			});

			chai.request(Tent.app())
			.post("/api/userauths/signup")
			.send({
				email 		: "johnyNotEmail",
				password	: "w"
			})
			.then((res)=>
			{
				try
				{
					expect(res).to.have.status(400);
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done)
		});

		it("should deny invalid inputs - wrong password minimum length",function(done)
		{
			Tent.set("auth validation options", {
				passwordMin: 10000
			});

			chai.request(Tent.app())
			.post("/api/userauths/signup")
			.send({
				email 		: "johnyNotEmail",
				password	: "w"
			})
			.then((res)=>
			{
				try
				{
					expect(res).to.have.status(400);
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done)
		});

		it("should deny invalid inputs - wrong password maximum length",function(done)
		{
			Tent.set("auth validation options", {
				passwordMax: 1
			});

			chai.request(Tent.app())
			.post("/api/userauths/signup")
			.send({
				email 		: "johnyNotEmail",
				password	: "wwwwww"
			})
			.then((res)=>
			{
				try
				{
					expect(res).to.have.status(400);
					done();
				}
				catch(err)
				{
					done(err);
				}
			})
			.catch(done)
		});

		it("create new user",function(done)
		{
			Tent.set("auth validation options", {
				emailPattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				passwordPattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
				emailMin: 6,
				emailMax: 32,
				passwordMin: 6,
				passwordMax: 32
			});

			chai.request(Tent.app())
			.post("/api/userauths/signup")
			.send({
				email 		: "johny@gmail.com",
				password	: "Iwannabeatutubi#2"
			})
			.then((res)=>
			{
				try
				{
					expect(res).to.have.status(200);
					expect(res.body.token).to.exist;
					token = res.body.token;
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

	describe("CURLD Requests with no auth",function()
	{

		let _id : string;
		describe("LIST Request",function()
		{
			it("should return proper value",function(done)
			{
				chai.request(Tent.app())
				.get("/api/userauths")
				.send()
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect(res.body.length).to.be.equal(2);
						_id = res.body[0]._id;
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
			it("should be denied",function(done)
			{
				let sample_body = { name : "First Client", };

				chai.request(Tent.app())
				.post("/api/userauths")
				.send(sample_body)
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(403);
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
				chai.request(Tent.app())
				.get("/api/userauths/"+_id)
				.send()
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(403);
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
				let sample_body = {};

				chai.request(Tent.app())
				.put("/api/userauths/"+_id)
				.send(sample_body)
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(403);
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
				chai.request(Tent.app())
				.delete("/api/userauths/"+_id)
				.send()
				.then(async(res)=>
				{
					try
					{
						expect(res).to.have.status(403);
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
	});



	describe("Login",function()
	{
		before(function()
		{
			token = "";
		});
		describe("unactivated user",function()
		{
			it("should deny malformed request..",function(done)
			{
				chai.request(Tent.app())
				.post("/api/userauths/login")
				.send({
					email 		: "johny@gmail.com",
					password	: "w"
				})
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(400);
						done();
					}
					catch(err)
					{
						done(err);
					}
				})
				.catch(done)
			});
			it("should not found user.",function(done)
			{
				chai.request(Tent.app())
				.post("/api/userauths/login")
				.send({
					email 		: "johny@gmail.com",
					password	: "Iwannabeatutubi#2"
				})
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(401);
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
		describe("activated user",function()
		{
			before(async function()
			{
				let collection = entity.Schema.model;
				if(!collection) return;
				await collection.updateMany({},{ $set: { active : true } });
			});

			it("should reject password.",function(done)
			{

				chai.request(Tent.app())
				.post("/api/userauths/login")
				.send({
					email 		: "johny@gmail.com",
					password	: "w"
				})
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(400);
						done();
					}
					catch(err)
					{
						done(err);
					}
				});
			});

			it("should logged in.",function(done)
			{

				chai.request(Tent.app())
				.post("/api/userauths/login")
				.send({
					email 		: "johny@gmail.com",
					password	: "Iwannabeatutubi#2"
				})
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect(res.body.token).to.exist;
						token = res.body.token;
						done();
					}
					catch(err)
					{
						done(err);
					}
				});
			});
		})
	});






	describe("CURLD Requests with auth",function()
	{

		let _id : string;


		describe("LIST Request",function()
		{
			it("should return proper value",function(done)
			{
				chai.request(Tent.app())
				.get("/api/userauths")
				.set("Authorization","Bearer "+token)
				.send()
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect(res.body.length).to.be.equal(2);
						_id = res.body[0]._id;
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
				let sample_body = { name : "First Client" };

				chai.request(Tent.app())
				.post("/api/userauths")
				.set("Authorization","Bearer "+token)
				.send(sample_body)
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect(res.body).to.exist;
						_id = res.body._id;
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
				chai.request(Tent.app())
				.get("/api/userauths/"+_id)
				.set("Authorization","Bearer "+token)
				.send()
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(200);
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
				let sample_body = { name : "First Client - Updated" };

				chai.request(Tent.app())
				.put("/api/userauths/"+_id)
				.set("Authorization","Bearer "+token)
				.send(sample_body)
				.then((res)=>
				{
					try
					{
						expect(res).to.have.status(200);
						expect(res.body.name).to.be.equal(sample_body.name);
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
				chai.request(Tent.app())
				.delete("/api/userauths/"+_id)
				.set("Authorization","Bearer "+token)
				.send()
				.then(async(res)=>
				{
					try
					{
						expect(res).to.have.status(200);
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