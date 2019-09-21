import { Server } from "../../components/server";
import { assert, expect } from "chai";
import { Server as HttpServer} 	from "http";
import * as Mongoose 	 from "mongoose";


var server : Server;
describe("Server",()=>
{
	describe('#constructor',function()
	{
		it('should return an object',()=>
		{
			server = new Server();
			expect(server).to.be.an('object');
		});	
		it('should have http server',()=>
		{
			expect(server.server).to.be.an.instanceof( HttpServer );
		});
	});

	describe("#initDefaultMiddlewares()",function()
	{
		it('should not throw errors',function()
		{
			expect(function()
			{
				server.initDefaultMiddlewares();
			}).to.not.throw();
		});
	});

	describe("#initDatabase()",function()
	{
		it('should not throw errors',function()
		{
			expect(function()
			{
				server.initDatabase(process.env.TEST_MONGODB_URI as string);
			}).to.not.throw();
		});
	});

	describe("#start()",function()
	{
		it('should not throw errors',function()
		{
			expect(function()
			{
				server.start();
			}).to.not.throw();
		});	
	});

	// describe("#close()",function()
	// {
	// 	it('should not throw errors',function()
	// 	{
	// 		expect(function()
	// 		{
	// 			server.close();
	// 		}).to.not.throw();
	// 	});		
	// });

});

after(function()
{
	server.close();
})