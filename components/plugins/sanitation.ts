import { Plugin, PluginInterface }  from "../plugin";
import { Accessor , Document }  from "../routes/accessor";
import { Request as ExpressRequest, Response ,NextFunction } from "express";
import assert = require("assert");
import { Model } from "../model";


interface Request extends ExpressRequest
{
	tent?: Accessor<any>
}

function isKey<T>( field : (keyof T) | (keyof T)[]  ) : field is keyof T
{
	return typeof field == "string";
}

class Bound<T>
{
	whitelisted : ( keyof T )[] = [];
	blacklisted : ( keyof T )[] = [];

	whitelist( field : (keyof T) | (keyof T)[] ) : void
	{
		assert( !this.blacklisted.length, "You can only whitelist or blaclist but not both." );
		
		if(isKey<T>(field))		
			this.whitelisted.push(field);
		else
			this.whitelisted.push(...field);
	}

	blacklist( field : (keyof T) | (keyof T)[] ) : void
	{
		assert( !this.whitelisted.length, "You can only whitelist or blaclist but not both." );
		
		if(isKey<T>(field))
			this.blacklisted.push(field);
		else
			this.blacklisted.push(...field);
	}

}

interface Dictionary
{
	[ key : string ] : any;
}

@Plugin({
	name: "sanitation",
	dependencies: []
})
export class Sanitation<T>
{
	inbound : Bound<T>;
	outbound : Bound<T>;
	model ?: Model<T>;

	constructor()
	{
		this.inbound  = new Bound<T>();
		this.outbound = new Bound<T>();
	}

	init()
	{
		if(this.model)
		{
			this.model.Routes.builder("/","POST").post("model",this.inboundMiddleware());
			this.model.Routes.builder("/","PUT").post("model",this.inboundMiddleware());

			this.model.Routes.builder("/","GET").pre("show",this.outboundMiddleware());
			this.model.Routes.builder("/","LIST").pre("present",this.outboundMiddleware());


		}
	}

	inboundMiddleware()
	{
		const _this = this;
		return function( req: Request, res: Response, next : NextFunction )
		{
			let inbound = _this.inbound;

			//whitelist
			if(inbound.whitelisted.length)
			{
				let body : Partial<T> = {};
				for(let i of inbound.whitelisted)
					body[i] = req.body[i];
				req.body = body;
			}
			//blacklist
			else
			{
				let body : Partial<T> = {};
				for(let i of inbound.blacklisted)
					if(i in req.body)
						delete req.body[i];
			}
			next();
		}
	}

	outboundMiddleware()
	{
		const _this = this;
		return function( req: Request, res: Response, next : NextFunction )
		{
			let tent : Accessor<T> = req.tent as Accessor<T>;

			//sanitize list
			let outbound = _this.outbound;

			if(outbound.whitelisted.length)
			{
				if(tent.list)
				{
					tent.list = tent.list.map( (x : Document<T>) => 
					{
						let d : Document<T> = {} as Document<T>;

						for( let i of outbound.whitelisted )
							d[i] = x.get(i as string);

						return d;
					} );
				}
				if(tent.document)
				{
					let d : Document<T> = {} as Document<T>;
					for( let i of outbound.whitelisted )
						d[i] = tent.document.get(i as string);
					tent.document = d;
				}
			}
			else
			{
				if(tent.list)
				{
					tent.list = tent.list.map( (x : Document<T>) => 
					{
						for( let i of outbound.blacklisted )
							if(x[i])
								delete x[i];
						return x;
					} );
				}
				if(tent.document)
				{
					for( let i of outbound.blacklisted )
						if(tent.document[i])
							delete tent.document[i];
				}
			}

			next()

		}
	}
}

export interface Sanitation<T> extends PluginInterface{}