import { assert } from "chai";

export function todo()
{
	it('todo');
}

export function promisify( middleware : any , req, res)
{
	return new Promise(async(resolve,reject)=>
	{
		let called =false;
		let next = function(err?)
		{
			if(called) return ;

			called = true;
			if(err) return reject(err);
			resolve();
		};

		let _send = res.send;
		let send = function(...args)
		{
			process.nextTick(()=>
			{
				next();
			});
			return _send(...args);
		}
		res.send = send;

		try
		{
			await middleware(req,res,next);
		}
		catch(err)
		{
			reject(err);
		}
	});
}