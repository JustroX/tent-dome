import { Mongoose , Schema as MongooseSchema, model as MongooseModel } from "mongoose";
import { Model } from "./model";


interface MongooseSchemaInterface extends MongooseSchema {};
interface MongooseModelInterface  extends MongooseModel {};

interface VirtualInterface<T>
{
	set? (value: T) : void,
	get? () : T,
	[ key : string ] : any
}


interface VirtualsStoreInterface
{
	[ key : string ] : VirtualInterface<any>
}

export interface SchemaConfig
{
	[ key : string ] : any;
}

export interface SchemaDefinition
{
	[ key : string ] : any;
}

export class Schema
{
	private schema 	 : SchemaDefinition = {};
	private virtuals : VirtualsStoreInterface = {};
	private config	 : SchemaConfig = {};
	private name     : string;
	
	model  		   : MongooseModel = {};
	mongooseSchema : MongooseSchemaInterface = {};
	

	constructor(name : string)
	{
		this.name = name;
	}

	define( schema: SchemaDefinition , config? : SchemaConfig ) : void
	{
		this.schema = schema;

		if(config)
			for(let i in config)
				this.set(i,config[i]);
	}

	virtual<T>(key: string, virtual : VirtualInterface<T> ) : void
	{
		this.virtuals[key] = virtual;
	}

	set(key : string, value : any) : void
	{
		this.config[key] = value;
	}

	get(key : string) : any
	{
		return this.config[key];
	}

	register()
	{
		this.mongooseSchema = new MongooseSchema( this.schema , this.config );
		this.model = MongooseModel(this.name , this.mongooseSchema);
	}
}