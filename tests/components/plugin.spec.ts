import { PluginOptions, Plugin } from "../../components/plugin";

import { assert, expect, use } from "chai";
import { todo } from "../util";


describe("Plugin",function()
{
	describe("Plugin Decorator",function()
	{
		it("should throw when class has no init() method",function()
		{
			class A{};
			expect( function()
			{
				Plugin({
					name : "Sample",
					dependencies: ["a","b"]
				})(A);
			} ).to.throw();
			
		});
		it("should add name and dependecies",function()
		{
			class cons{init(){}};
			Plugin({
				name : "Sample",
				dependencies : ["a","b"]
			})( cons );
			expect( (cons as any).prototype.name ).to.be.equal("Sample");
			expect( (cons as any).prototype.dependencies ).to.be.deep.equal(["a","b"]);
		});
	});
});