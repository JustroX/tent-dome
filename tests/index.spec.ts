import * as Tent from "../index";
import { assert, expect,use } from "chai";

import "./tent.spec";

describe("Tent Module",function()
{
	it("Tent should be available",function()
	{
		expect(Tent.Tent).to.exist;
	});
	it("Plugin should be available",function()
	{
		expect(Tent.Plugin).to.exist;
	});
	it("Route should be available",function()
	{
		expect(Tent.Route).to.exist;
	});
	it("Sanitation Plugin should be available",function()
	{
		expect(Tent.Sanitation).to.exist;
	});
	it("Validation Plugin should be available",function()
	{
		expect(Tent.Validation).to.exist;
	});
	it("Types should be available",function()
	{
		expect(Tent.Types).to.exist;
	});
	it("TentDome should be available",function()
	{
		expect(Tent.TentDome).to.exist;
	});
});