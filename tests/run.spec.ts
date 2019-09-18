import { TentDome } from "../index";
import { assert, expect } from "chai";

describe("Tent sample run 1.",function()
{
	var Tent = new TentDome();
	var entity ;

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

	it("should initialize properly",function()
	{
		expect(function()
		{
			Tent.init({
				"mongoose uri": process.env.MONGODB_URI
			});
		}).to.not.throw();
	});


	it("should create new entity",function()
	{
		entity = Tent.Entity<SampleSchema>("sample",
		{
			name   : String,
			number : Number,
			list   :
			[{
				number: Number,
				text: String,
				date: { type: Date, default: Date.now }
			}]
		});
	});

	it("should start properly",function()
	{
		Tent.start();
	});


	after(function()
	{
		Tent.AppServer.close();
	});


});