import { Model , RegisterModels  } from "./components/model";
import { Server , HttpServerInterface } from "./components/server";
import { SchemaDefinition , SchemaConfig } from "./components/schema"


export interface TentOptionsInterface
{
	"api prefix"   ?: string,
	"mongoose uri" ?: string
}

export class TentDome
{
	AppServer : Server					= null;
	TentOptions: TentOptionsInterface	= null;

	Models : Model<any>[] = [];
	
	constructor(){}

	init( options : TentOptionsInterface ) : void
	{
		this.setDefaultOptions();
		for(let i in options)
			this.TentOptions[i] = options[i];

		this.AppServer = new Server();
	}

	setDefaultOptions()
	{
		this.set<string>("api prefix", "api");
	}



	/**
	 * Setter and Getter functions for the Options
	 */

	set<T>( key : string , value : T ) : void
	{
		this.TentOptions[key] = value;
	}
	get<T>( key : string ) : T
	{
		return this.TentOptions[key];
	}

	/**
	 * Entity related
	 */

	Entity<T>( name: string, schema ?: SchemaDefinition , config ?: SchemaConfig ) : Model<T>
	{
		let model = new Model<T>(name);

		if(schema)
			model.define( schema , config );
		
		return model;
	}


	/**
	 * Application Server accessors
	 */

	start( port : number = 7072 ) : Promise<void>
	{
		RegisterModels(this.AppServer.app());
		this.AppServer.initDatabase( this.get<string>("mongoose uri") );
		return this.AppServer.start( port );
	}

	server() : HttpServerInterface
	{
		return this.AppServer.server;
	}

	app() 
	{
		return this.AppServer.app;
	}
}

export var Tent = new TentDome();