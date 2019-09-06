import { Request, Response, Next } from "express";
import * as Middlewares from "./middlewares";
import * as Assert from "assert";
import * as Hooks from "hooks";

const BUILT_IN_FACTORIES : readonly string[] = 
[ 
	"model", 	//

	"create", 	//
	"save",		// 
	"read",   	//
	"remove", 	//

	"assign", 	//
	"sanitize", //

	"param",	
	"list",		//
];

export class Builder<T> extends Hooks
{
	private middlewares : (( req : Request , res: Response, next : Next  )=> void)[] = [];
	head : number = 0;
	name : string = "";

	hook : Hooks.hook;
	pre	 : Hooks.pre;
	post : Hooks.post;
	
	constructor( name : string )
	{
		super();
		this.importBuiltIn();
		this.name = name;
	}

	custom(mw : ( req : Request , res: Response, next : Next  )=> void )
	{
		this.middlewares.splice( this.head , 0 , mw );
		this.head ++;
	}

	pointHead( index : number )
	{
		Assert( index >=0  && index < this.middlewares.length , "Head index out of range" );
		this.head = index;
	}

	lookHead()
	{
		return this.middlewares[this.head];
	}

	prevHead()
	{
		this.pointHead( this.head - 1 );
	}

	nextHead()
	{
		this.pointHead( this.head + 1 );
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
			this.middlewares.splice( this.head , 0 , mw ) 
		};
		
		this.hook(name, mw);
	}

	preHook( name : string, mw : ( req : Request , res: Response, next : Next  )=> void )
	{
		this.pre(name,( nextHook , req, res, next )=>
		{
			mw( req, res, (...args)=>
			{
				if(args.length) next(...args);
				else
					nextHook( req, res, next );
			});
		});
	}
	
	postHook( name : string, mw : ( req : Request , res: Response, next : Next  )=> void )
	{
		this.post(name,( nextHook , req, res, next )=>
		{
			mw( req, res, (...args)=>
			{
				if(args.length) next(...args);
				else
					nextHook( req, res, next );
			});
		});
	}

	expose() :  (( req : Request , res: Response, next : Next  )=> void)[] 
	{
		return this.middlewares; 
	}
}