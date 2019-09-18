"use strict";
exports.__esModule = true;
var server_1 = require("../../components/server");
var chai_1 = require("chai");
var http_1 = require("http");
describe("Server", function () {
    var server;
    describe('#constructor', function () {
        it('should return an object', function () {
            server = new server_1.Server();
            chai_1.expect(server).to.be.an('object');
        });
        it('should have http server', function () {
            chai_1.expect(server.server).to.be.an["instanceof"](http_1.Server);
        });
    });
    describe("#initDefaultMiddlewares()", function () {
        it('should not throw errors', function () {
            chai_1.expect(function () {
                server.initDefaultMiddlewares();
            }).to.not["throw"]();
        });
    });
    describe("#initDatabase()", function () {
        it('should not throw errors', function () {
            chai_1.expect(function () {
                server.initDatabase(process.env.MONGODB_URI);
            }).to.not["throw"]();
        });
    });
    describe("#start()", function () {
        it('should not throw errors', function () {
            chai_1.expect(function () {
                server.start();
            }).to.not["throw"]();
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
