

export interface PopulateStore
{
	[ key : string ] : string
}

export class Expand
{
	populate : PopulateStore = {};

	constructor()
	{

	}

	add( key : string, fields: string  )
	{
		this.populate[key] = fields;
	}

	expose()
	{
		return this.populate;
	}

	isExpandable(key: string)
	{
		if(this.populate[key])
			return true;
		return false;
	}
}