/**
* @module Params
*/


/*******
*
*	Copyright (C) 2019  Justine Che T. Romero
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
********/



import { parse } from "query-string";


/** Object definition for query parameters. */
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

/** Object definition for unprocessed queries`. */
export interface RawQuery
{
	[ key : string ] : string | number | boolean;
}

/** Returns a processed query from string url parameters
 * @param param parameters from url string. e.g. `limit=120&offset=0`
 */
export function Parse( param : string ) : QueryParams 
{
	let raw : RawQuery = parse(param,{
		parseNumbers: true,
		parseBooleans: true
	}) as RawQuery;
	let output : QueryParams = {  sort: {}, pagination: { limit: 10, offset: 0 }, filters: {}, populate: [] };

	Sort(output, raw);
	Pagination(output, raw);
	Filters(output,raw);
	Expand(output,raw);

	return output;
}

/**
* Parses the sort part of the query and assigns them properly to `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export function Sort( result : QueryParams , raw : RawQuery )
{
	let extractField = ( fieldValue : string ) : { val: string , orientation : number } =>
	{
		let indexOfDash = fieldValue.indexOf('-') + 1;
		return { val : fieldValue.slice( indexOfDash, ) , orientation : 1 - 2*Number(fieldValue[0]=='-') };
	};

	if(raw.sort)
	{
		let { val , orientation } = extractField(raw.sort as string);
		result.sort[val] = orientation;
	}
}

/**
* Parses the pagination part of the query and assigns them properly to `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export function Pagination( result : QueryParams , raw : RawQuery )
{
	if(raw.limit)  result.pagination.limit  = raw.limit  as number;
	if(raw.offset) result.pagination.offset = raw.offset as number;
}

/**
* Parses the filter part of the query and assigns them properly to `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export function Filters(  result : QueryParams , raw : RawQuery  )
{
	FilterSanitize( result, raw );
	FilterParse( result );
}

/**
* Removes reserved keywords from the the query and assigns remaining fields `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export function FilterSanitize(   result : QueryParams , raw : RawQuery   )
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


/**
* Parses the filter part of the query and assigns them properly to `result`.
* Parses special data types tokens.
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export function FilterParse( result : QueryParams )
{
	for(let key in result.filters)
	{
		let filterValue = result.filters[key];

		if(typeof filterValue != "string")
		{
			result.filters[key] = filterValue;
			return;				
		}

		let bounds  : string[] = filterValue.split("..");
		let list    : string[] = filterValue.split(",");

		let isRange : boolean  = bounds.length == 2;
		let isList  : boolean  =   list.length  > 1;

		let lower, upper, value;

		if(isRange)
		{
			lower = ValueParse(bounds[0]);
			upper = ValueParse(bounds[1]);

			result.filters[key] = {};

			if(lower) result.filters[key].$gte = lower;
			if(upper) result.filters[key].$lte = upper;

		}
		else
		if(isList)
		{
			for(let i in list)
				list[i] = ValueParse(list[i]);

			result.filters[key] = { $in : list };
		}
		else
		{
			value = ValueParse(bounds[0]);
			result.filters[key] = value;
		}


	}
}

/**
* Parses a string to a certain structure and data type.
* @param value string to be parsed.
*/
export function ValueParse( value : string ) : any
{
	let prefix : string = value.slice( 0, 4 );
	let unparsedValue : string = value.slice(4,);

	if( prefix == "$dt_" )
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
	if( prefix == "$nll" )
		return null;
	return prefix + unparsedValue;
}


/**
* Parses the expand part of the query and assigns them properly to `result`.
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export function Expand(  result : QueryParams , raw : RawQuery  )
{
	if(!raw.expand) return;		
	/**
	*  @todo Validate if field has read permissions 
	*/
	for(let field of ( raw.expand  as string ).split(",") )
		result.populate.push( field  );
}