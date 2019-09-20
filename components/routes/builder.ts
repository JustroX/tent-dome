import { Request, Response, Next } from "express";
import * as Middlewares from "./middlewares";
import * as Assert from "assert";

export const BUILT_IN_FACTORIES : readonly string[] = 
[ 
	"model", 	//

	"create", 	//
	"save",		// 
	"read",   	//
	"remove", 	//


	"assign", 	//
	"sanitize", //

	"param",	//
	"list",		//

	"success",  // return success message
	"show",		// return value
	"present"   // return list
];

export interface BuilderOptions
{
	"import builtin" : boolean
}

export class Builder<T>
{
	private middlewares : (( req : Request , res: Response, next : Next  )=> void)[] = [];
	head : number = 0;
	name : string = "";

	//Builtin functions
	model : any = null;
	create : any = null;
	save : any = null;
	read : any = null;
	remove : any = null;
	assign : any = null;
	sanitize : any = null;
	param : any = null;
	list : any = null;
	success : any = null;
	show : any = null;
	present : any = null;
	
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

	custom(mw : ( req : Request , res: Response, next : Next  )=> void )
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

	importBuiltIn()
	{
		for( let mw of BUILT_IN_FACTORIES )
			this.define(mw, Middlewares[mw]<T>( this.name ) );
	}

	define( name : string, mw : ( req : Request , res: Response, next : Next  )=> void )
	{
		Assert( !this[name] , "Builder pipe is already defined" );
		
		const _this = this;
		this[name] = function()
		{ 
			this.middlewares.splice( this.head , 0 , mw );
			this.head++;
			return this;
		};

		this[name].tag = name; 
	}

	pre( name : string, mw : ( req : Request , res: Response, next : Next  )=> void )
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
	
	post( name : string, mw : ( req : Request , res: Response, next : Next  )=> void )
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

	expose() :  (( req : Request , res: Response, next : Next  )=> void)[] 
	{
		return this.middlewares; 
	}
}