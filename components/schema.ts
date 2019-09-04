import { Mongoose , Schema as MongooseSchema, Model as MongooseModel } from "mongoose";
import { ModelInterface } from "./model";


interface MongooseSchemaInterface extends MongooseSchema {};
interface MongooseModelInterface  extends MongooseModel {};

interface VirtualInterface<T>
{
	set? (value: T) : void,
	get? () : T
}


interface VirtualsStoreInterface
{
	[ key : string ] : VirtualInterface<any>
}

interface SchemaConfig
{
	[ key : string ] : any;
}

interface SchemaDefinition
{
	[ key : string ] : any;
}

export class Schema
{
	private schema 	 : SchemaDefinition;
	private virtuals : VirtualsStoreInterface = {};
	private config	 : SchemaConfig = {};
	private parent   : ModelInterface;
	
	model  		   : MongooseModel;
	mongooseSchema : MongooseSchemaInterface;
	

	constructor(parent : ModelInterface)
	{
		this.parent = parent;
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
		const BLACKLIST : string[] = ["define","virtual","set","get","register"];

		if(BLACKLIST.indexOf(key) >= 0)
			throw `Can not set ${key}, ${key} is a reserved keyword.`;

		this.config[key] = value;
	}

	get(key : string) : any
	{
		return this.config[key];
	}

	register()
	{
		this.mongooseSchema = new MongooseSchema( this.schema , this.config );
	}
}

export interface SchemaInterface extends Schema{};