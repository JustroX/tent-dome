import { Expand } from "../../components/expand";

// describe("Expand",function() 
// {
// 	var expand;
// 	describe("#constuctor",function()
// 	{
// 		it("should not throw",function()
// 		{
// 			expect(function()
// 			{
// 				expand = new Expand();
// 			}).to.not.throw();
// 		});

// 		it("should have an empty `populate` store",function()
// 		{
// 			expect(expand.populate).to.exist;
// 			expect(expand.populate).to.be.deep.equal({});
// 		});

// 		it("should have add function",function()
// 		{
// 			expect(expand.add).to.exist;
// 			expect(expand.add).to.be.typeof("function");
// 		});
		
// 		it("should have expose function",function()
// 		{
// 			expect(expand.expose).to.exist;
// 			expect(expand.expose).to.be.typeof("function");
// 		});

// 		it("should have isExpandable function",function()
// 		{
// 			expect(expand.isExpandable).to.exist;
// 			expect(expand.isExpandable).to.be.typeof("function");
// 		});
// 	});
// 	describe("#add",function()
// 	{
// 		it("should save expand on `populate` store",function()
// 		{
// 			expect(function()
// 			{
// 				expand.add("comments","name date");
// 			}).to.not.throw();		

// 			expect(expand.populate).to.exist;
// 			expect(expand.populate["comments"]).to.exist;
// 			expect(expand.populate["comments"]).to.be.equal("name date");
// 		});
// 	});
// 	describe("expose",function()
// 	{
// 		it("should expose `populate` store",function()
// 		{
// 			expect(expand.expose).to.exist;
// 			expect(expand.expose()).to.be.equal(expand.populate);
// 		});
// 	});
// })