import { Collection } from "./index";
import { assert, expect } from "chai";

describe("index",()=>
{
	describe("Collection()",()=>
	{
		let collection = Collection();
		it('should return an object',()=>
		{
			expect(collection).to.be.an('object');
		});
	});
});