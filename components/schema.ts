import { Schema as MongooseSchema, model as MongooseModel, Document, Model, SchemaDefinition as Definition } from "mongoose";

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

export type SchemaDefinition<T> = T & Document;

export class Schema<T>
{
	private schema 	 : Definition = {};
	private virtuals : VirtualsStoreInterface = {};
	private config	 : SchemaConfig = {};
	private name     : string;
	
	model  		   : Model<SchemaDefinition<T>> | undefined;
	mongooseSchema : MongooseSchema | undefined;
	

	constructor(name : string)
	{
		this.name = name;
	}

	define( schema: Definition, config? : SchemaConfig ) : void
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
		this.mongooseSchema = new MongooseSchema( this.schema as Definition , this.config );
		this.model = MongooseModel<SchemaDefinition<T>>(this.name , this.mongooseSchema);
	}
}