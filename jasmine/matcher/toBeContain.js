'use strict';

(function(jasmine)
{
	jasmine.Expectation.addCoreMatchers(
	{
		toBeContain: function()
		{
			return {
				compare: function(actual, expected)
				{
					if (Object.prototype.toString.apply(actual) !== '[object Array]')
					{
						throw new Error('Expected a array, but got ' + jasmine.pp(actual) + '.');
					}

					for (var i = 0; i < actual.length; i++)
					{
						if (actual[i] === expected)
						{
							return {
								pass: true
							};
						}
					}

					return {
						pass: false
					};
				}
			};
		}
	});
})(jasmine);