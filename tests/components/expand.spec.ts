import { Expand } from "../../components/expand";

import { assert, expect, use } from "chai";
import { todo } from "../util";

describe("Expand",function() 
{
	var expand : Expand;
	describe("#constuctor",function()
	{
		it("should not throw",function()
		{
			expect(function()
			{
				expand = new Expand();
			}).to.not.throw();
		});

		it("should have an empty `populate` store",function()
		{
			expect(expand.populate).to.exist;
			expect(expand.populate).to.be.deep.equal({});
		});

		it("should have add function",function()
		{
			expect(expand.add).to.exist;
			expect(expand.add).to.be.a("function");
		});
		
		it("should have expose function",function()
		{
			expect(expand.expose).to.exist;
			expect(expand.expose).to.be.a("function");
		});

		it("should have isExpandable function",function()
		{
			expect(expand.isExpandable).to.exist;
			expect(expand.isExpandable).to.be.a("function");
		});
	});
	describe("#add",function()
	{
		it("should save expand on `populate` store",function()
		{
			expect(function()
			{
				expand.add("comments","name date");
			}).to.not.throw();		

			expect(expand.populate).to.exist;
			expect(expand.populate["comments"]).to.exist;
			expect(expand.populate["comments"]).to.be.equal("name date");
		});
	});
	describe("expose",function()
	{
		it("should expose `populate` store",function()
		{
			expect(expand.expose).to.exist;
			expect(expand.expose()).to.be.equal(expand.populate);
		});
	});

	describe("isExpandable",function()
	{
		it('should return whether field is in `populate` store.',function()
		{
			expect(expand.isExpandable).to.exist;
			expect(expand.isExpandable("comments")).to.be.equal(true);
			expect(expand.isExpandable("non-existent")).to.be.equal(false);
		});
	});
})