import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { Accessor, Dispatcher } from "./accessor";
import Assert = require("assert");

type Request<T>  = ExpressRequest & {tent ?: Accessor<T>};
type Response = ExpressResponse & {tent ?: Dispatcher};

class Middleware
{
	constructor(){};

	initTent<T>(req : Request<T>, res : Response,next : NextFunction)
	{
		req.tent = new Accessor<T>(  req , res  );
		res.tent = new Dispatcher( req , res);
		next();	
	}


	model<T>( name : string)
	{
		return function modelMiddleware( req : Request<T> , res : Response, next : NextFunction )
		{
			(req.tent as Accessor<T>).Model( name );
			next();
		}
	}

	read<T>()
	{
		return async function readMiddleware( req : Request<T> , res : Response, next : NextFunction )
		{
			Assert( req.params.id , "Id parameter is missing." );
			
			try
			{
				await (req.tent as Accessor<T>).Read( req.params.id );
			}
			catch( e )
			{
				if(e.name == "AssertionError" || e.name=="CastError")
					return (res.tent as Dispatcher).apiError(404,"Document not found");
				throw e;
			}		

			next();
		}
	}

	create<T>()
	{
		return function createMiddleware( req : Request<T> , res : Response, next : NextFunction )
		{
			Assert((req.tent as Accessor<T>).collection, "'create' middleware can not be called without calling 'model' middleware first.");
			(req.tent as Accessor<T>).FreshDocument();
			next();
		}
	}

	sanitize<T>()
	{
		return function sanitizeMiddleware( req : Request<T> , res : Response, next : NextFunction )
		{
			Assert((req.tent as Accessor<T>).collection, "'sanitize' middleware can not be called without calling 'model' middleware first.");
			Assert((req.tent as Accessor<T>).document,   "'sanitize' middleware can not be called without calling 'create' or 'read' middleware first.");

			( req.tent as Accessor<T> ).Sanitize( req.body );

			next();
		};
	}

	assign<T>()
	{
		return function assignMiddleware( req : Request<T> , res : Response, next : NextFunction )
		{
			Assert((req.tent as Accessor<T>).collection, "'assign' middleware can not be called without calling 'model' middleware first.");
			Assert((req.tent as Accessor<T>).document,   "'assign' middleware can not be called without calling 'create' or 'read' middleware first.");
			Assert((req.tent as Accessor<T>).payload ,   "'assign' middleware can not be called without calling 'sanitize' middleware first.");

			(req.tent as Accessor<T>).Assign();

			next();
		}
	}

	save<T>()
	{
		return async function saveMiddleware(req : Request<T>, res : Response, next : NextFunction)
		{ 
			Assert((req.tent as Accessor<T>).collection, "'save' middleware can not be called without calling 'model' middleware first.");
			Assert((req.tent as Accessor<T>).document,   "'save' middleware can not be called without calling 'create' or 'read' middleware first.");

			try
			{
				await (req.tent as Accessor<T>).Save();
			}
			catch(e)
			{
				throw e;
			}
			next();
		}
	}


	remove<T>()
	{
		return async function removeMiddleware(req : Request<T> ,res : Response, next: NextFunction)
		{ 
			Assert((req.tent as Accessor<T>).collection, "'remove' middleware can not be called without calling 'model' middleware first.");
			Assert((req.tent as Accessor<T>).document,   "'remove' middleware can not be called without calling 'read' middleware first.");

			try
			{
				await (req.tent as Accessor<T>).Delete();
			}
			catch(e)
			{
				throw e;
			}
			next();
		}
	}

	list<T>()
	{
		return async function listMiddleware(req : Request<T> ,res : Response , next :  NextFunction)
		{ 
			Assert((req.tent as Accessor<T>).collection, "'list' middleware can not be called without calling 'model' middleware first.");
			Assert((req.tent as Accessor<T>).param     , "'list' middleware can not be called without calling 'param' middleware first.");
			try
			{
				await (req.tent as Accessor<T>).List();
			}
			catch(e)
			{
				throw e;
			}
			next();
		}
	}

	param<T>()
	{
		return function paramMiddleware(req : Request<T> ,res : Response,next : NextFunction)
		{ 
			(req.tent as Accessor<T>).Param( req.query );
			next();
		};
	}


	success<T>( )
	{
		return function successMiddleware (req : Request<T> ,res : Response,next : NextFunction)
		{ 
			res.status(200).send({
				message : "Success",
				code: 200
			});
		}
	}

	show<T>()
	{
		return function showMiddleware (req : Request<T> ,res : Response,next : NextFunction)
		{ 
			Assert((req.tent as Accessor<T>).document, "'show' middleware can not be called without calling 'read' or 'create' middleware first.");
			res.status(200).send(
				(req.tent as Accessor<T>).Show()
			);
		}
	}

	present<T>()
	{
		return function presentMiddleware (req : Request<T> ,res : Response,next : NextFunction)
		{ 
			res.status(200).send(
				(req.tent as Accessor<T>).Present()
			);
		}
	}
}

export var Middlewares = new Middleware();