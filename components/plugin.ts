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
	[ key : string ] : any
}


export function Plugin( options : PluginOptions ) 
{
	return function( constructorFn : Function )
	{
		if(!constructorFn.prototype.init)
			throw "Plugins should have an init() method.";
		constructorFn.prototype.name = options.name;
		constructorFn.prototype.dependencies = options.dependencies;
	}
}