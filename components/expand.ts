/**
* @module Expand
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

/** Dictionary of the fields to be populated. */
export interface PopulateStore
{
	/** Field to be populated with its select query */
	[ key : string ] : string
}

export class Expand {
	/** Dictionary of populated fields */
	populate : PopulateStore = {};

	/** Set property of the model to be expandable
	* @param key name of the property
	* @param fields fields to be whitelisted when expanded.
	*/
	add (key : string, fields: string) {
	  this.populate[key] = fields
	}

	/** Returns the populated dictionary */
	expose () {
	  return this.populate
	}

	/** Returns whether a certain property is expandable
	* @param key name of the property
	*/
	isExpandable (key: string) {
	  if (this.populate[key]) { return true }
	  return false
	}
}
