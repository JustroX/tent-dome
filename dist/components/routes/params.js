"use strict";
/**
* @module Params
*/
exports.__esModule = true;
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
var query_string_1 = require("query-string");
/** Returns a processed query from string url parameters
 * @param param parameters from url string. e.g. `limit=120&offset=0`
 */
function Parse(param) {
    var raw = query_string_1.parse(param, {
        parseNumbers: true,
        parseBooleans: true
    });
    var output = { sort: {}, pagination: { limit: 10, offset: 0 }, filters: {}, populate: [] };
    Sort(output, raw);
    Pagination(output, raw);
    Filters(output, raw);
    Expand(output, raw);
    return output;
}
exports.Parse = Parse;
/**
* Parses the sort part of the query and assigns them properly to `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
function Sort(result, raw) {
    var extractField = function (fieldValue) {
        var indexOfDash = fieldValue.indexOf('-') + 1;
        return { val: fieldValue.slice(indexOfDash), orientation: 1 - 2 * Number(fieldValue[0] == '-') };
    };
    if (raw.sort) {
        var _a = extractField(raw.sort), val = _a.val, orientation_1 = _a.orientation;
        result.sort[val] = orientation_1;
    }
}
exports.Sort = Sort;
/**
* Parses the pagination part of the query and assigns them properly to `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
function Pagination(result, raw) {
    if (raw.limit)
        result.pagination.limit = raw.limit;
    if (raw.offset)
        result.pagination.offset = raw.offset;
}
exports.Pagination = Pagination;
/**
* Parses the filter part of the query and assigns them properly to `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
function Filters(result, raw) {
    FilterSanitize(result, raw);
    FilterParse(result);
}
exports.Filters = Filters;
/**
* Removes reserved keywords from the the query and assigns remaining fields `result`
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
function FilterSanitize(result, raw) {
    var BLACKLIST = ["sort", "limit", "offset", "expand"];
    for (var i in raw) {
        if (BLACKLIST.indexOf(i) == -1) {
            /**
             *	  @todo Validate if field has read permissions
             */
            result.filters[i] = raw[i];
        }
    }
}
exports.FilterSanitize = FilterSanitize;
/**
* Parses the filter part of the query and assigns them properly to `result`.
* Parses special data types tokens.
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
function FilterParse(result) {
    for (var key in result.filters) {
        var filterValue = result.filters[key];
        if (typeof filterValue != "string") {
            result.filters[key] = filterValue;
            return;
        }
        var bounds = filterValue.split("..");
        var list = filterValue.split(",");
        var isRange = bounds.length == 2;
        var isList = list.length > 1;
        var lower = void 0, upper = void 0, value = void 0;
        if (isRange) {
            lower = ValueParse(bounds[0]);
            upper = ValueParse(bounds[1]);
            result.filters[key] = {};
            if (lower)
                result.filters[key].$gte = lower;
            if (upper)
                result.filters[key].$lte = upper;
        }
        else if (isList) {
            for (var i in list)
                list[i] = ValueParse(list[i]);
            result.filters[key] = { $in: list };
        }
        else {
            value = ValueParse(bounds[0]);
            result.filters[key] = value;
        }
    }
}
exports.FilterParse = FilterParse;
/**
* Parses a string to a certain structure and data type.
* @param value string to be parsed.
*/
function ValueParse(value) {
    var prefix = value.slice(0, 4);
    var unparsedValue = value.slice(4);
    if (prefix == "$dt_")
        return new Date(unparsedValue);
    if (prefix == "$bl_")
        return unparsedValue == "true";
    if (prefix == "$zz_")
        return parseInt(unparsedValue);
    if (prefix == "$fl_")
        return parseFloat(unparsedValue);
    if (prefix == "$st_")
        return "" + unparsedValue;
    if (prefix == "$ne_")
        return { $ne: ValueParse(unparsedValue) };
    if (prefix == "$lk_")
        return { $regex: new RegExp(ValueParse(unparsedValue)), $options: 'i' };
    if (prefix == "$nll")
        return null;
    return prefix + unparsedValue;
}
exports.ValueParse = ValueParse;
/**
* Parses the expand part of the query and assigns them properly to `result`.
* @param result processed query param reference
* @param raw unprocessed query param reference
*/
function Expand(result, raw) {
    if (!raw.expand)
        return;
    for (var _i = 0, _a = raw.expand.split(","); _i < _a.length; _i++) {
        var field = _a[_i];
        result.populate.push(field);
    }
}
exports.Expand = Expand;
