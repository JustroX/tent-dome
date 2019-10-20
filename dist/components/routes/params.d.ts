/**
* @module Params
*/
/** Object definition for query parameters. */
export interface QueryParams {
    sort: {
        [key: string]: number;
    };
    pagination: {
        limit: number;
        offset: number;
    };
    filters: {
        [key: string]: any;
    };
    populate: string[];
    options: boolean;
}
/** Object definition for unprocessed queries`. */
export interface RawQuery {
    [key: string]: string | number | boolean;
}
/** Returns a processed query from string url parameters
 * @param param parameters from url string. e.g. `limit=120&offset=0`
 */
export declare function Parse(param: string): QueryParams;
/**
 * Parses the option part of the query and assigns them properly to `result`
 * @param result processed query param reference
 * @param raw unprocessed query param reference
 */
export declare function Option(result: QueryParams, raw: RawQuery): void;
/**
* Parses the sort part of the query and assigns them properly to `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export declare function Sort(result: QueryParams, raw: RawQuery): void;
/**
* Parses the pagination part of the query and assigns them properly to `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export declare function Pagination(result: QueryParams, raw: RawQuery): void;
/**
* Parses the filter part of the query and assigns them properly to `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export declare function Filters(result: QueryParams, raw: RawQuery): void;
/**
* Removes reserved keywords from the the query and assigns remaining fields `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export declare function FilterSanitize(result: QueryParams, raw: RawQuery): void;
/**
* Parses the filter part of the query and assigns them properly to `result`.
* Parses special data types tokens.
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export declare function FilterParse(result: QueryParams): void;
/**
* Parses a string to a certain structure and data type.
* @param value string to be parsed.
*/
export declare function ValueParse(value: string): any;
/**
* Parses the expand part of the query and assigns them properly to `result`.
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
export declare function Expand(result: QueryParams, raw: RawQuery): void;
