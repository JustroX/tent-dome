import { Request, Response, NextFunction } from "express";
import { Middlewares } from "./middlewares";
import Assert = require("assert");


export interface BuilderOptions
{
	"import builtin" : boolean
}

type Middleware = ( req : Request , res: Response, next : NextFunction  )=> void;

export class Builder<T>
{
	middlewares : ( Middleware )[] = [];
	head : number = 0;
	name : string = "";

	//Builtin functions
	model : any = undefined;
	create : any = undefined;
	save : any = undefined;
	read : any = undefined;
	remove : any = undefined;
	assign : any = undefined;
	sanitize : any = undefined;
	param : any = undefined;
	list : any = undefined;
	success : any = undefined;
	show : any = undefined;
	present : any = undefined;

	builds : 
	{
		[ name : string ]: (() => Builder<T>) & { tag?: string }
	} = {};
	
	constructor( name : string 
			, options : BuilderOptions = 
			{
				"import builtin" : true
			}
	)
	{
		this.name = name;

		if( options["import builtin"] )
			this.importBuiltIn();
	}

	custom(mw :  Middleware  )
	{
		this.middlewares.splice( this.head , 0 , mw );
		this.head ++;
		return this;
	}

	pointHead( index : number )
	{
		Assert( index >=0  && index < this.middlewares.length , "Head index out of range" );
		this.head = index;
		return this;
	}

	lookHead()
	{
		return this.middlewares[this.head];
	}

	prevHead()
	{
		this.pointHead( this.head - 1 );
		return this;
	}

	nextHead()
	{
		this.pointHead( this.head + 1 );
		return this;
	}

	replaceHead(mw : (req: Request, res: Response, next: NextFunction )=> void )
	{
		this.middlewares[this.head] = mw;
	}

	pop()
	{
		this.middlewares.pop();
		this.head = Math.min( this.head, this.middlewares.length - 1 );
	}

	importBuiltIn()
	{
		this.define("model", Middlewares.model<T>(this.name) ); 
		this.define("create", Middlewares.create<T>() ); 
		this.define("save", Middlewares.save<T>() ); 
		this.define("read", Middlewares.read<T>() ); 
		this.define("remove", Middlewares.remove<T>() ); 
		this.define("assign", Middlewares.assign<T>() ); 
		this.define("sanitize", Middlewares.sanitize<T>() ); 
		this.define("param", Middlewares.param<T>() ); 
		this.define("list", Middlewares.list<T>() ); 
		this.define("success", Middlewares.success<T>() ); 
		this.define("show", Middlewares.show<T>() ); 
		this.define("present", Middlewares.present<T>() ); 
	}

	define( name : string, mw :  Middleware  )
	{
		Assert( !(this as unknown as any)[name] , "Builder pipe is already defined" );
		
		const _this : Builder<T> = this;
		this.builds[name] = function()
		{ 
			_this.middlewares.splice( _this.head , 0 , mw );
			_this.head++;
			return _this;
		};

		this.builds[name].tag = name;

		Object.defineProperty(this,name,
		{
			get: function()
			{
				return this.builds[name]
			}
		}) 
	}

	pre( name : string, mw :  Middleware  )
	{
		for(let i=0; i<this.middlewares.length; i++)
		{
			if((this.middlewares[i] as any ).tag == name)
			{
				this.middlewares.splice( i , 0 , mw );
				return;
			}
		}	
	}
	
	post( name : string, mw :  Middleware  )
	{
		for(let i=0; i<this.middlewares.length; i++)
		{
			if((this.middlewares[i] as any ).tag == name)
			{
				this.middlewares.splice( i+1 , 0 , mw );
				return;
			}
		}	
	}

	expose() :  ( Middleware )[] 
	{
		return this.middlewares; 
	}
}