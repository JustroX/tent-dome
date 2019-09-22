import { Model } from "./model";

export interface PluginOptions
{
	name : string,
	dependencies : string[],
}

export interface PluginInterface
{
	name : string,
	dependencies: string[],
	init() : void,
	model ?: Model<any>,
	[ key : string ] : any
}

type Constructor<T> = { new(...args: any[]) : T }

function decorated( constructorFn : Constructor<any> ) : constructorFn is Constructor<PluginInterface>
{
	return true;
}

export function Plugin( options : PluginOptions ) 
{
	return function( constructorFn : Constructor<any> )
	{
		if(!constructorFn.prototype.init)
			throw "Plugins should have an init() method.";
		constructorFn.prototype.name = options.name;
		constructorFn.prototype.dependencies = options.dependencies;
		decorated( constructorFn );
	} 
}