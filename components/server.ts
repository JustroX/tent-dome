import { Server as HttpServer , createServer } 	from "http";

import Express = require("express");
import { Application } 	 from "express";
import CookieParser =  require("cookie-parser");
import BodyParser   =  require("body-parser");

import * as Mongoose 	 from "mongoose";

var urlencodedParser = BodyParser.urlencoded({extended: true});

export interface HttpServerInterface extends HttpServer {};

export class Server
{
	app    : Application;
	server : HttpServer;
	
	constructor()
	{
		this.app = Express();
		this.server = createServer(this.app);
		
		this.initDefaultMiddlewares();
	}

	initDefaultMiddlewares()
	{
		this.app.use(urlencodedParser);
		this.app.use(BodyParser.json());
		this.app.use(CookieParser());
	}

	initDatabase( databaseURI : string )
	{
		Mongoose.connect( databaseURI , { useNewUrlParser: true });
	}

	start( port ?: number  ) : Promise<void>
	{
		return new Promise<void>(
		(resolve, reject)=>
		{
			this.server.listen(port,()=>
			{
				resolve();
			});
		});
	}

	close()
	{
		this.server.close();
		Mongoose.connection.close();	
	}


}