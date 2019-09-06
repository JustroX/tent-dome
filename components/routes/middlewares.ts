import { Accessor, Dispatcher } from "./accessor";
import * as Assert from "assert";

export function initTent<T>(req,res,next)
{
	(req.tent  as Accessor<T> ) = new Accessor<T>(  req , res  );
	res.tent = new Dispatcher( req, res  );
	next();	
}


export function model<T>( name : string)
{
	return ( req, res, next )=>
	{
		(req.tent  as Accessor<T> ).Model( name );
		next();
	}
}

export function read<T>( name ?: string)
{
	return async( req, res, next )=>
	{
		Assert( req.params.id , "Id parameter is missing." );
		
		try
		{
			await (req.tent  as Accessor<T> ).Read( req.params.id );
		}
		catch( e )
		{
			if(e.toString() == "Document not found")
				res.tent.apiError(404,"Document not found");
			throw e;
		}		

		next();
	}
}

export function create<T>( name ?: string )
{
	return ( req, res, next )=>
	{
		Assert((req.tent  as Accessor<T> ).collection, "'create' middleware can not be called without calling 'model' middleware first.");
		(req.tent  as Accessor<T> ).FreshDocument();
		next();
	}
}

export function sanitize<T>( name ?: string )
{
	return ( req, res, next ) =>
	{
		Assert((req.tent  as Accessor<T> ).collection, "'sanitize' middleware can not be called without calling 'model' middleware first.");
		Assert((req.tent  as Accessor<T> ).document,   "'sanitize' middleware can not be called without calling 'create' or 'read' middleware first.");

		( req.tent as Accessor<T> ).Sanitize( req.body );

		next();
	};
}

export function assign<T>( name ?: string )
{
	return ( req , res, next )=>
	{
		Assert((req.tent  as Accessor<T> ).collection, "'assign' middleware can not be called without calling 'model' middleware first.");
		Assert((req.tent  as Accessor<T> ).document,   "'assign' middleware can not be called without calling 'create' or 'read' middleware first.");
		Assert((req.tent  as Accessor<T> ).payload ,   "'assign' middleware can not be called without calling 'sanitize' middleware first.");

		(req.tent  as Accessor<T> ).Assign();

		next();
	}
}

export function save<T>( name ?: string )
{
	return async(req,res, next) =>
	{
		Assert((req.tent  as Accessor<T> ).collection, "'save' middleware can not be called without calling 'model' middleware first.");
		Assert((req.tent  as Accessor<T> ).document,   "'save' middleware can not be called without calling 'create' or 'read' middleware first.");

		try
		{
			await req.tent.Save();
		}
		catch(e)
		{
			throw e;
		}
		next();
	}
}


export function remove<T>( name ?: string )
{
	return async(req,res, next) =>
	{
		Assert((req.tent  as Accessor<T> ).collection, "'remove' middleware can not be called without calling 'model' middleware first.");
		Assert((req.tent  as Accessor<T> ).document,   "'remove' middleware can not be called without calling 'read' middleware first.");

		try
		{
			await req.tent.Delete();
		}
		catch(e)
		{
			throw e;
		}
		next();
	}
}

export function list<T>( name ?: string )
{
	return async(req,res, next) =>
	{
		Assert((req.tent  as Accessor<T> ).collection, "'list' middleware can not be called without calling 'model' middleware first.");
		Assert((req.tent  as Accessor<T> ).param     , "'list' middleware can not be called without calling 'param' middleware first.");
		try
		{
			await req.tent.List();
		}
		catch(e)
		{
			throw e;
		}
		next();
	}
}

export function param<T>( name ?: string)
{
	return (req,res,next)=>
	{
		req.tent.Parse( req.query );
		next();
	};
}


export function success<T>( name ?: string )
{
	return (req,res,next)=>
	{
		res.status(200).send({
			message : "Success",
			code: 200
		});
	}
}

export function show<T>( name ?: string )
{
	return (req,res,next)=>
	{
		res.status(200).send(
			(req.tent as Accessor<T>).Show()
		);
	}
}

export function present<T>( name ?: string )
{
	return (req,res,next)=>
	{
		res.status(200).send(
			(req.tent as Accessor<T>).Present()
		);
	}
}