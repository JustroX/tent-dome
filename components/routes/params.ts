import { parse } from "query-string";


export interface QueryParams
{
	sort 	   : 
	{
		[ key : string ] : number
	};
	pagination : 
	{
		limit  : number;
		offset : number;
	};
	filters    : 
	{
		[ key : string ] : any
	};
	populate   : string[];
}

export interface RawQuery
{
	[ key : string ] : string | number | boolean;
}

export function Parse( param : string ) : QueryParams 
{
	let raw : RawQuery = parse(param,{
		parseNumbers: true,
		parseBooleans: true
	}) as RawQuery;
	let output : QueryParams = {  sort: {}, pagination: { limit: 0, offset: 0 }, filters: {}, populate: [] };

	Sort(output, raw);
	Pagination(output, raw);
	Filters(output,raw);
	Expand(output,raw);

	return output;
}

function Sort( result : QueryParams , raw : RawQuery )
{
	this.extractField = ( fieldValue : string ) : { val: string , orientation : number } =>
	{
		let indexOfDash = fieldValue.indexOf('-') + 1;
		return { val : fieldValue.slice( indexOfDash, ) , orientation : 1 - 2*Number(fieldValue[0]=='-') };
	};

	/**
	 * @todo Validate if field has read permissions 
	 */

	if(raw.sort)
	{
		let { val , orientation } = this.extractField(raw.sort);
		result.sort[val] = orientation;
	}
}

function Pagination( result : QueryParams , raw : RawQuery )
{
	if(raw.limit)  result.pagination.limit  = raw.limit  as number;
	if(raw.offset) result.pagination.offset = raw.offset as number;
}

function Filters(  result : QueryParams , raw : RawQuery  )
{
	FilterSanitize( result, raw );
	FilterParse( result );
}

function FilterSanitize(   result : QueryParams , raw : RawQuery   )
{
	const BLACKLIST = [ "sort"  , "limit", "offset" , "expand" ];
	for(let i in raw)
	{
		if(BLACKLIST.indexOf(i)==-1)
		{
			/**
			 *	  @todo Validate if field has read permissions 
			 */
			result.filters[i] = raw[i];
		}
	}

}

function FilterParse( result : QueryParams )
{
	for(let key in result.filters)
	{
		let bounds  : string[] = result.filters[key].split("..");
		let list    : string[] = result.filters[key].split(",");

		let isRange : boolean  = bounds.length == 2;
		let isList  : boolean  =   list.length  > 0;

		let lower, upper, value;

		if(isRange)
		{
			lower = ValueParse(bounds[0]);
			upper = ValueParse(bounds[1]);

			result.filters[key] = {};

			if(lower) result.filters[key].$gte = lower;
			if(upper) result.filters[key].$lte = upper;

		}
		if(isList)
		{
			for(let i in list)
				list[i] = ValueParse(list[i]);

			result.filters[key] = { $in : list };
		}
		else
		{
			value = ValueParse(bounds[1]);
			result.filters[key] = value;
		}


	}
}

function ValueParse( value : string ) : any
{
	let prefix : string = value.slice( 0, 4 );
	let unparsedValue : string = value.slice(4,);

	if( prefix == "$dl_" )
		return new Date(unparsedValue);
	if( prefix == "$bl_" )
		return unparsedValue == "true";
	if( prefix == "$zz_" )
		return parseInt( unparsedValue );
	if( prefix == "$fl_" )
		return parseFloat( unparsedValue );
	if( prefix == "$st_" )
		return "" + unparsedValue;
	if( prefix == "$ne_" )
		return { $ne : ValueParse(unparsedValue) };
	if( prefix == "$lk_" )
		return { $regex: new RegExp( ValueParse(unparsedValue) ) , $options: 'i' };
	// if( prefix == "$nll" )
		return null;
}

function Expand(  result : QueryParams , raw : RawQuery  )
{
	if(!raw.expand) return;		
	/**
	*  @todo Validate if field has read permissions 
	*/
	for(let field of ( raw.expand  as string ).split(",") )
		result.populate.push( field  );
}